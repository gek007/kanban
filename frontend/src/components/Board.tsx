"use client";

import { useMemo, useReducer } from "react";
import {
  DndContext,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Column } from "@/components/Column";
import { seedBoard } from "@/data/seedBoard";
import { boardReducer } from "@/state/boardReducer";
import type { ColumnId } from "@/types/kanban";

function getColumnByCardId(state: typeof seedBoard, cardId: string): ColumnId | null {
  for (const columnId of state.columnOrder) {
    if (state.columns[columnId].cardIds.includes(cardId)) {
      return columnId;
    }
  }
  return null;
}

export function Board() {
  const [state, dispatch] = useReducer(boardReducer, seedBoard);
  const sensors = useSensors(useSensor(PointerSensor));

  const cardIdSet = useMemo(() => new Set(Object.keys(state.cards)), [state.cards]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      return;
    }

    const activeCardId = String(active.id);
    if (!cardIdSet.has(activeCardId)) {
      return;
    }

    const fromColumnId = getColumnByCardId(state, activeCardId);
    if (!fromColumnId) {
      return;
    }

    const fromIndex = state.columns[fromColumnId].cardIds.indexOf(activeCardId);
    if (fromIndex < 0) {
      return;
    }

    const overId = String(over.id);
    let toColumnId: ColumnId | null = null;
    let toIndex = 0;

    if (overId.startsWith("column-drop-")) {
      toColumnId = overId.replace("column-drop-", "") as ColumnId;
      toIndex = state.columns[toColumnId].cardIds.length;
    } else if (cardIdSet.has(overId)) {
      toColumnId = getColumnByCardId(state, overId);
      if (!toColumnId) {
        return;
      }
      toIndex = state.columns[toColumnId].cardIds.indexOf(overId);
    }

    if (!toColumnId) {
      return;
    }

    dispatch({
      type: "moveCard",
      payload: { fromColumnId, toColumnId, fromIndex, toIndex },
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="board-wrapper" data-testid="board">
        <div className="board-grid">
          {state.columnOrder.map((columnId) => (
            <Column
              key={columnId}
              column={state.columns[columnId]}
              cardsById={state.cards}
              onRename={(id, name) =>
                dispatch({ type: "renameColumn", payload: { columnId: id, name } })
              }
              onAddCard={(id, title, details) =>
                dispatch({
                  type: "addCard",
                  payload: { columnId: id, title, details },
                })
              }
              onDeleteCard={(id, cardId) =>
                dispatch({
                  type: "deleteCard",
                  payload: { columnId: id, cardId },
                })
              }
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}

