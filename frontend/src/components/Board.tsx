"use client";

import { useReducer } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Column } from "@/components/Column";
import { seedBoard } from "@/data/seedBoard";
import { boardReducer, findColumnByCardId } from "@/state/boardReducer";
import type { ColumnId } from "@/types/kanban";

// Valid column IDs for validation
const VALID_COLUMN_IDS: ReadonlyArray<string> = ["col-1", "col-2", "col-3", "col-4", "col-5"];

/**
 * Checks if a string is a valid ColumnId
 * @param id - The string to validate
 * @returns true if the string is a valid ColumnId
 */
function isValidColumnId(id: string): id is ColumnId {
  return VALID_COLUMN_IDS.includes(id);
}

/**
 * Board component that manages the Kanban board state and drag-and-drop functionality.
 * Uses a pure reducer pattern for state management and @dnd-kit for drag-and-drop.
 */
export function Board() {
  const [state, dispatch] = useReducer(boardReducer, seedBoard);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const cardIdSet = new Set(Object.keys(state.cards));

  /**
   * Handles the end of a drag operation by calculating the source and destination
   * of the dragged card and dispatching the appropriate moveCard action.
   * @param event - The drag end event from @dnd-kit
   */
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) {
      return;
    }

    const activeCardId = String(active.id);
    if (!cardIdSet.has(activeCardId)) {
      return;
    }

    const fromColumnId = findColumnByCardId(state, activeCardId);
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
      const extractedId = overId.replace("column-drop-", "");
      if (isValidColumnId(extractedId)) {
        toColumnId = extractedId;
        toIndex = state.columns[toColumnId].cardIds.length;
      } else {
        return; // Invalid column ID, ignore the drag
      }
    } else if (cardIdSet.has(overId)) {
      toColumnId = findColumnByCardId(state, overId);
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
