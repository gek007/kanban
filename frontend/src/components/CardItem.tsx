import { memo, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import type { Card, ColumnId } from "@/types/kanban";

/**
 * Props for the CardItem component
 * @property card - The card data including id, title, and details
 * @property columnId - The ID of the column this card belongs to
 * @property onDelete - Callback function invoked when the delete is confirmed
 */
interface CardItemProps {
  card: Card;
  columnId: ColumnId;
  onDelete: (columnId: ColumnId, cardId: string) => void;
}

export const CardItem = memo(function CardItem({ card, columnId, onDelete }: CardItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: card.id,
      data: { columnId },
    });

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setIsDeleteDialogOpen(false);
    onDelete(columnId, card.id);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
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
            onClick={handleDeleteClick}
            aria-label={`Delete ${card.title}`}
          >
            Delete
          </button>
        </div>
      </li>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        title="Delete Card"
        message={`Are you sure you want to delete "${card.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        variant="danger"
      />
    </>
  );
});