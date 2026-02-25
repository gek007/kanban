import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { AddCardForm } from "@/components/AddCardForm";
import { CardItem } from "@/components/CardItem";
import { EditableColumnTitle } from "@/components/EditableColumnTitle";
import type { BoardState, Column, ColumnId } from "@/types/kanban";

interface ColumnProps {
  column: Column;
  cardsById: BoardState["cards"];
  onRename: (columnId: ColumnId, name: string) => void;
  onAddCard: (columnId: ColumnId, title: string, details: string) => void;
  onDeleteCard: (columnId: ColumnId, cardId: string) => void;
}

export function Column({
  column,
  cardsById,
  onRename,
  onAddCard,
  onDeleteCard,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: `column-drop-${column.id}`,
  });

  return (
    <section className="column" data-testid={`column-${column.id}`} ref={setNodeRef}>
      <header className="column-header">
        <EditableColumnTitle
          columnId={column.id}
          value={column.name}
          onSave={(name) => onRename(column.id, name)}
        />
      </header>
      <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
        <ul className="card-list">
          {column.cardIds.map((cardId) => (
            <CardItem
              key={cardId}
              card={cardsById[cardId]}
              columnId={column.id}
              onDelete={onDeleteCard}
            />
          ))}
        </ul>
      </SortableContext>
      <AddCardForm
        columnId={column.id}
        onSubmit={(title, details) => onAddCard(column.id, title, details)}
      />
    </section>
  );
}

