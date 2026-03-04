import type { BoardAction, BoardState, ColumnId } from "@/types/kanban";

/**
 * Starting value for generated card IDs.
 * Starts at 100 to avoid collision with seeded cards (task-1 through task-7).
 */
let generatedCardSequence = 100;

/**
 * Generates a unique ID for a new card
 * @returns A unique card ID string
 */
function nextCardId() {
  generatedCardSequence += 1;
  return `task-generated-${generatedCardSequence}`;
}

/**
 * Clamps a value between a minimum and maximum
 * @param value - The value to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The clamped value
 */
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Moves an item from one index to another in an array
 * @param items - The array to modify
 * @param fromIndex - The index of the item to move
 * @param toIndex - The destination index
 * @returns A new array with the item moved
 */
function moveInArray<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const copy = [...items];
  const [item] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, item);
  return copy;
}

/**
 * Finds the column ID that contains a specific card
 * @param state - The current board state
 * @param cardId - The card ID to search for
 * @returns The column ID if found, null otherwise
 */
export function findColumnByCardId(state: BoardState, cardId: string): ColumnId | null {
  for (const columnId of state.columnOrder) {
    if (state.columns[columnId].cardIds.includes(cardId)) {
      return columnId;
    }
  }
  return null;
}

/**
 * Pure reducer function that handles all board state mutations.
 * Supports actions: renameColumn, addCard, deleteCard, moveCard
 * @param state - The current board state
 * @param action - The action to apply
 * @returns The new board state
 */
export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "renameColumn": {
      const { columnId, name } = action.payload;
      const trimmed = name.trim();
      if (!trimmed) {
        return state;
      }

      return {
        ...state,
        columns: {
          ...state.columns,
          [columnId]: {
            ...state.columns[columnId],
            name: trimmed,
          },
        },
      };
    }

    case "addCard": {
      const { columnId, title, details } = action.payload;
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return state;
      }

      const cardId = nextCardId();
      return {
        ...state,
        cards: {
          ...state.cards,
          [cardId]: {
            id: cardId,
            title: trimmedTitle,
            details: details.trim(),
          },
        },
        columns: {
          ...state.columns,
          [columnId]: {
            ...state.columns[columnId],
            cardIds: [...state.columns[columnId].cardIds, cardId],
          },
        },
      };
    }

    case "deleteCard": {
      const { columnId, cardId } = action.payload;
      if (!state.cards[cardId]) {
        return state;
      }

      const remainingCards = { ...state.cards };
      delete remainingCards[cardId];
      return {
        ...state,
        cards: remainingCards,
        columns: {
          ...state.columns,
          [columnId]: {
            ...state.columns[columnId],
            cardIds: state.columns[columnId].cardIds.filter((id) => id !== cardId),
          },
        },
      };
    }

    case "moveCard": {
      const { fromColumnId, toColumnId, fromIndex, toIndex } = action.payload;
      const sourceIds = state.columns[fromColumnId].cardIds;
      if (sourceIds.length === 0 || fromIndex < 0 || fromIndex >= sourceIds.length) {
        return state;
      }

      const movingCardId = sourceIds[fromIndex];
      const actualFromColumnId = findColumnByCardId(state, movingCardId);
      if (!actualFromColumnId) {
        return state;
      }

      if (fromColumnId === toColumnId) {
        const targetIndex = clamp(toIndex, 0, sourceIds.length - 1);
        const reordered = moveInArray(sourceIds, fromIndex, targetIndex);
        return {
          ...state,
          columns: {
            ...state.columns,
            [fromColumnId]: {
              ...state.columns[fromColumnId],
              cardIds: reordered,
            },
          },
        };
      }

      const destinationIds = state.columns[toColumnId].cardIds;
      const sourceWithoutCard = sourceIds.filter((id) => id !== movingCardId);
      const destinationWithCard = [...destinationIds];
      const insertIndex = clamp(toIndex, 0, destinationWithCard.length);
      destinationWithCard.splice(insertIndex, 0, movingCardId);

      return {
        ...state,
        columns: {
          ...state.columns,
          [fromColumnId]: {
            ...state.columns[fromColumnId],
            cardIds: sourceWithoutCard,
          },
          [toColumnId]: {
            ...state.columns[toColumnId],
            cardIds: destinationWithCard,
          },
        },
      };
    }

    default:
      return state;
  }
}
