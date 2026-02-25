import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Card, ColumnId } from "@/types/kanban";

interface CardItemProps {
  card: Card;
  columnId: ColumnId;
  onDelete: (columnId: ColumnId, cardId: string) => void;
}

export function CardItem({ card, columnId, onDelete }: CardItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { columnId },
    });

  return (
    <li
      ref={setNodeRef}
      className={`card${isDragging ? " is-dragging" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      data-testid={`card-${card.id}`}
      {...attributes}
      {...listeners}
    >
      <h4>{card.title}</h4>
      <p>{card.details}</p>
      <div className="card-actions">
        <button
          type="button"
          className="delete-button"
          data-testid={`delete-card-${card.id}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(columnId, card.id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
