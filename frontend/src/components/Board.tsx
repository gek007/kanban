"use client";

import { useReducer, useEffect, useCallback } from "react";
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
import { boardReducer, findColumnByCardId } from "@/state/boardReducer";
import { initializeBoardState, saveBoardState } from "@/utils/storage";
import { useAnnouncement, formatAnnouncement } from "@/hooks/useAnnouncement";
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
  const [state, dispatch] = useReducer(boardReducer, initializeBoardState());
  const { announce } = useAnnouncement();

  // Persist state to localStorage on every change
  useEffect(() => {
    saveBoardState(state);
  }, [state]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Wrapper callbacks that add announcements
  const handleRename = useCallback((columnId: ColumnId, name: string) => {
    const oldName = state.columns[columnId].name;
    dispatch({ type: "renameColumn", payload: { columnId, name } });

    // Announce the rename after state update
    requestAnimationFrame(() => {
      const message = formatAnnouncement("column-renamed", {
        oldName,
        newName: name.trim(),
      });
      announce(message, "info");
    });
  }, [state.columns, announce]);

  const handleAddCard = useCallback((columnId: ColumnId, title: string, details: string) => {
    dispatch({ type: "addCard", payload: { columnId, title, details } });

    // Announce the card addition after state update
    requestAnimationFrame(() => {
      const message = formatAnnouncement("card-added", {
        cardTitle: title.trim(),
        columnName: state.columns[columnId].name,
      });
      announce(message, "info");
    });
  }, [announce]);

  const handleDeleteCard = useCallback((columnId: ColumnId, cardId: string) => {
    const card = state.cards[cardId];
    dispatch({ type: "deleteCard", payload: { columnId, cardId } });

    // Announce the card deletion
    if (card) {
      const message = formatAnnouncement("card-deleted", {
        cardTitle: card.title,
        columnName: state.columns[columnId].name,
      });
      announce(message, "card-deleted");
    }
  }, [state.cards, state.columns, announce]);

  const cardIdSet = new Set(Object.keys(state.cards));

  /**
   * Handles the end of a drag operation by calculating the source and destination
   * of the dragged card and dispatching the appropriate moveCard action.
   * Also announces the move to screen readers.
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

    // Get card info before dispatching (for announcement)
    const card = state.cards[activeCardId];

    dispatch({
      type: "moveCard",
      payload: { fromColumnId, toColumnId, fromIndex, toIndex },
    });

    // Announce the card move
    if (card) {
      requestAnimationFrame(() => {
        const message = formatAnnouncement("card-moved", {
          cardTitle: card.title,
          fromColumn: state.columns[fromColumnId].name,
          toColumn: state.columns[toColumnId].name,
          columnName: fromColumnId === toColumnId ? state.columns[toColumnId].name : undefined,
        });
        announce(message, "info");
      });
    }
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
              onRename={handleRename}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
