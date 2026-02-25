import { FormEvent, useState } from "react";

interface AddCardFormProps {
  columnId: string;
  onSubmit: (title: string, details: string) => void;
}

export function AddCardForm({ columnId, onSubmit }: AddCardFormProps) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setError("Card title is required.");
      return;
    }
    onSubmit(title, details);
    setTitle("");
    setDetails("");
    setError("");
  };

  return (
    <form className="add-card-form" onSubmit={handleSubmit}>
      <label className="field-hint" htmlFor={`card-title-${columnId}`}>
        Add card
      </label>
      <input
        id={`card-title-${columnId}`}
        data-testid={`add-title-${columnId}`}
        className="card-title-input"
        placeholder="Title"
        value={title}
        maxLength={120}
        onChange={(event) => setTitle(event.target.value)}
      />
      <textarea
        data-testid={`add-details-${columnId}`}
        className="card-details-input"
        placeholder="Details"
        value={details}
        maxLength={500}
        rows={3}
        onChange={(event) => setDetails(event.target.value)}
      />
      {error ? <p className="field-error">{error}</p> : null}
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

