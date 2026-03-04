/**
 * Valid column identifiers for the Kanban board
 */
export type ColumnId = "col-1" | "col-2" | "col-3" | "col-4" | "col-5";

/**
 * Represents a card in the Kanban board
 * @property id - Unique identifier for the card
 * @property title - The card's title (max 120 characters)
 * @property details - Optional detailed description (max 500 characters)
 */
export interface Card {
  id: string;
  title: string;
  details: string;
}

/**
 * Represents a column in the Kanban board
 * @property id - The column's unique identifier
 * @property name - The display name of the column (user-editable)
 * @property cardIds - Ordered list of card IDs in this column
 */
export interface Column {
  id: ColumnId;
  name: string;
  cardIds: string[];
}

/**
 * Represents the entire board state
 * @property columns - Map of column IDs to column data
 * @property cards - Map of card IDs to card data
 * @property columnOrder - Fixed ordering of the 5 columns
 */
export interface BoardState {
  columns: Record<ColumnId, Column>;
  cards: Record<string, Card>;
  columnOrder: ColumnId[];
}

/**
 * Union type of all possible board actions for state management
 * - renameColumn: Updates a column's name
 * - addCard: Creates a new card in a column
 * - deleteCard: Removes a card from a column
 * - moveCard: Moves a card within or between columns
 */
export type BoardAction =
  | { type: "renameColumn"; payload: { columnId: ColumnId; name: string } }
  | {
      type: "addCard";
      payload: { columnId: ColumnId; title: string; details: string };
    }
  | { type: "deleteCard"; payload: { columnId: ColumnId; cardId: string } }
  | {
      type: "moveCard";
      payload: {
        fromColumnId: ColumnId;
        toColumnId: ColumnId;
        fromIndex: number;
        toIndex: number;
      };
    };

