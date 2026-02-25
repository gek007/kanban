export type ColumnId = "col-1" | "col-2" | "col-3" | "col-4" | "col-5";

export interface Card {
  id: string;
  title: string;
  details: string;
}

export interface Column {
  id: ColumnId;
  name: string;
  cardIds: string[];
}

export interface BoardState {
  columns: Record<ColumnId, Column>;
  cards: Record<string, Card>;
  columnOrder: ColumnId[];
}

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

