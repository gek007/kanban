import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { Column } from "./Column";
import type { BoardState, Column as ColumnType } from "@/types/kanban";

const mockColumn: ColumnType = {
  id: "col-1",
  name: "Backlog",
  cardIds: ["task-1", "task-2"],
};

const mockCards: BoardState["cards"] = {
  "task-1": {
    id: "task-1",
    title: "First Task",
    details: "First details",
  },
  "task-2": {
    id: "task-2",
    title: "Second Task",
    details: "Second details",
  },
};

describe("Column", () => {
  it("lists the provided cards", () => {
    render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { level: 2, name: "Backlog" })).toBeInTheDocument();
    expect(screen.getByText("First Task")).toBeInTheDocument();
    expect(screen.getByText("Second Task")).toBeInTheDocument();
  });

  it("emits rename events", async () => {
    const user = userEvent.setup();
    const onRename = vi.fn();

    render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={onRename}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename backlog/i });
    await user.clear(input);
    await user.type(input, "New Name{Enter}");

    expect(onRename).toHaveBeenCalledWith("col-1", "New Name");
  });

  it("emits add-card events from the form", async () => {
    const user = userEvent.setup();
    const onAddCard = vi.fn();

    render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={onAddCard}
        onDeleteCard={vi.fn()}
      />
    );

    const column = screen.getByRole("heading", { level: 2, name: "Backlog" }).closest("section");
    const titleInput = within(column as HTMLElement).getByRole("textbox", { name: /add card/i });
    const submit = within(column as HTMLElement).getByRole("button", { name: "Add Card" });

    await user.type(titleInput, "New Card");
    await user.click(submit);

    expect(onAddCard).toHaveBeenCalledWith("col-1", "New Card", "");
  });

  it("emits delete-card events", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={onDelete}
      />
    );

    const firstCard = screen.getByText("First Task").closest("li");
    const deleteButton = within(firstCard as HTMLElement).getByRole("button", { name: "Delete" });
    await user.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith("col-1", "task-1");
  });
});
