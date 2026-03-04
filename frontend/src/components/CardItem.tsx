import { memo } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { Card, ColumnId } from "@/types/kanban";

/**
 * Props for the CardItem component
 * @property card - The card data including id, title, and details
 * @property columnId - The ID of the column this card belongs to
 * @property onDelete - Callback function invoked when the delete button is clicked
 */
interface CardItemProps {
  card: Card;
  columnId: ColumnId;
  onDelete: (columnId: ColumnId, cardId: string) => void;
}

export const CardItem = memo(function CardItem({ card, columnId, onDelete }: CardItemProps) {
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
      {card.details && <p>{card.details}</p>}
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
});