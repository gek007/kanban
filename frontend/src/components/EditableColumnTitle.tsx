import { useEffect, useState } from "react";

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
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const saveAndClose = () => {
    onSave(draft);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        data-testid={`rename-input-${columnId}`}
        aria-label={`Rename ${value}`}
        className="title-input"
        value={draft}
        autoFocus
        onChange={(event) => setDraft(event.target.value)}
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
        onClick={() => setIsEditing(true)}
      >
        Rename
      </button>
    </>
  );
}

