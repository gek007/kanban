import { FormEvent, useState, useRef, useEffect } from "react";

/**
 * Props for the AddCardForm component
 * @property columnId - The unique identifier for the column where the card will be added
 * @property onSubmit - Callback function invoked with the title and details when the form is submitted
 * @property onCancel - Optional callback for canceling the form (Escape key)
 */
interface AddCardFormProps {
  columnId: string;
  onSubmit: (title: string, details: string) => void;
  onCancel?: () => void;
}

export function AddCardForm({ columnId, onSubmit, onCancel }: AddCardFormProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus the title input when component mounts
  useEffect(() => {
    titleInputRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Card title is required.");
      titleInputRef.current?.focus();
      return;
    }
    onSubmit(title, details);
    setTitle("");
    setDetails("");
    setError("");
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (title || details || error) {
        // Only cancel if there's content, otherwise just do nothing
        setTitle("");
        setDetails("");
        setError("");
      }
      onCancel?.();
    }
  };

  return (
    <form className="add-card-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <label className="field-hint" htmlFor={`card-title-${columnId}`}>
        Add card
      </label>
      <input
        ref={titleInputRef}
        id={`card-title-${columnId}`}
        data-testid={`add-title-${columnId}`}
        className="card-title-input"
        placeholder="Title"
        value={title}
        maxLength={120}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `card-title-error-${columnId}` : undefined}
        onChange={(event) => {
          const nextTitle = event.target.value;
          setTitle(nextTitle);
          if (error && nextTitle.trim()) {
            setError("");
          }
        }}
      />
      <label className="field-hint" htmlFor={`card-details-${columnId}`}>
        Details (optional)
      </label>
      <textarea
        id={`card-details-${columnId}`}
        data-testid={`add-details-${columnId}`}
        className="card-details-input"
        placeholder="Details"
        value={details}
        maxLength={500}
        rows={3}
        onChange={(event) => setDetails(event.target.value)}
      />
      {error ? (
        <p className="field-error" id={`card-title-error-${columnId}`}>
          {error}
        </p>
      ) : null}
      <button
        className="submit-button"
        data-testid={`add-submit-${columnId}`}
        type="submit"
      >
        Add Card
      </button>
    </form>
  );
}
