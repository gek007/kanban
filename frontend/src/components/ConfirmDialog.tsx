import { useEffect, useRef } from "react";

/**
 * Props for the ConfirmDialog component
 */
export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Title of the dialog */
  title: string;
  /** Description/message to display */
  message: string;
  /** Text for the confirm button (default: "Delete") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Callback when confirmed */
  onConfirm: () => void;
  /** Callback when cancelled */
  onCancel: () => void;
  /** Whether this is a dangerous action (affects styling) */
  variant?: "danger" | "default";
}

/**
 * Accessible confirmation dialog component with focus trap and keyboard support.
 *
 * Features:
 * - Focus trap: Tab cycles within the dialog
 * - Escape key closes the dialog
 * - Enter key confirms (when confirm button has focus)
 * - ARIA attributes for screen readers
 * - Body scroll lock when open
 */
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  variant = "danger",
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement;

      // Focus the confirm button when dialog opens
      confirmButtonRef.current?.focus();

      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Restore body scroll
      document.body.style.overflow = "";

      // Restore focus to previous element when dialog closes
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    }

    return () => {
      // Cleanup: restore body scroll and focus
      document.body.style.overflow = "";
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Focus trap: keep Tab focus within the dialog
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const handleTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;

      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      // If shift + tab on first element, move to last
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
      // If tab on last element, move to first
      else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    const dialogElement = dialogRef.current;
    dialogElement.addEventListener("keydown", handleTab);

    return () => {
      dialogElement.removeEventListener("keydown", handleTab);
    };
  }, [isOpen]);

  // Handle Escape key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  return (
    <div
      className="dialog-overlay"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="presentation"
      data-testid="confirm-dialog-overlay"
    >
      <div
        ref={dialogRef}
        className="dialog-container"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        data-testid="confirm-dialog"
      >
        <div className="dialog-content">
          <h2 id="dialog-title" className="dialog-title" data-testid="dialog-title">
            {title}
          </h2>
          <p id="dialog-description" className="dialog-message" data-testid="dialog-message">
            {message}
          </p>

          <div className="dialog-actions">
            <button
              ref={cancelButtonRef}
              type="button"
              className="dialog-button dialog-button-cancel"
              onClick={onCancel}
              data-testid="dialog-cancel-button"
            >
              {cancelText}
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              className={`dialog-button ${isDanger ? "dialog-button-danger" : "dialog-button-primary"}`}
              onClick={onConfirm}
              data-testid="dialog-confirm-button"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
