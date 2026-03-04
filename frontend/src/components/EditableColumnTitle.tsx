import { useRef, useState } from "react";

/**
 * Props for the EditableColumnTitle component
 * @property columnId - The unique identifier for the column
 * @property value - The current column title value
 * @property onSave - Callback function invoked when the user saves a new column name
 */
interface EditableColumnTitleProps {
  columnId: string;
  value: string;
  onSave: (name: string) => void;
}

export function EditableColumnTitle({
  columnId,
  value,
  onSave,
}: EditableColumnTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const saveAndClose = () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      setError("Column title cannot be empty.");
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
      return;
    }
    onSave(trimmed);
    setError(null);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setError(null);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div>
        <input
          ref={inputRef}
          data-testid={`rename-input-${columnId}`}
          aria-label={`Rename ${value}`}
          className="title-input"
          value={draft}
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `column-title-error-${columnId}` : undefined}
          onChange={(event) => {
            setDraft(event.target.value);
            if (error) {
              setError(null);
            }
          }}
          onBlur={saveAndClose}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              saveAndClose();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              cancel();
            }
          }}
        />
        {error ? (
          <p className="field-error" id={`column-title-error-${columnId}`}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <h2 className="column-title" data-testid={`column-title-${columnId}`}>
        {value}
      </h2>
      <button
        type="button"
        className="rename-button"
        data-testid={`rename-column-${columnId}`}
        onClick={() => {
          setDraft(value);
          setError(null);
          setIsEditing(true);
        }}
      >
        Rename
      </button>
    </>
  );
}
