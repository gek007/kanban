import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
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
    details: "Details for first task",
  },
  "task-2": {
    id: "task-2",
    title: "Second Task",
    details: "Details for second task",
  },
};

describe("Column", () => {
  it("renders column with name and cards", () => {
    render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("First Task")).toBeInTheDocument();
    expect(screen.getByText("Second Task")).toBeInTheDocument();
  });

  it("renders empty column", () => {
    const emptyColumn: ColumnType = {
      id: "col-2",
      name: "Empty",
      cardIds: [],
    };

    render(
      <Column
        column={emptyColumn}
        cardsById={{}}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    expect(screen.getByText("Empty")).toBeInTheDocument();
  });

  it("calls onRename when column title is renamed", async () => {
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
    const input = screen.getByRole("textbox", { name: /rename/i });
    await user.clear(input);
    await user.type(input, "New Name{Enter}");

    expect(onRename).toHaveBeenCalledWith("col-1", "New Name");
  });

  it("calls onAddCard when form is submitted", async () => {
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

    await user.type(screen.getByPlaceholderText("Title"), "New Card");
    await user.click(screen.getByRole("button", { name: "Add Card" }));

    expect(onAddCard).toHaveBeenCalledWith("col-1", "New Card", "");
  });

  it("calls onDeleteCard when card delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDeleteCard = vi.fn();

    render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={onDeleteCard}
      />
    );

    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
    await user.click(deleteButtons[0]);

    expect(onDeleteCard).toHaveBeenCalledWith("col-1", "task-1");
  });

  it("has correct data-testid for column", () => {
    render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    expect(screen.getByTestId("column-col-1")).toBeInTheDocument();
  });

  it("renders cards in correct order", () => {
    const { container } = render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    const cardList = container.querySelector(".card-list");
    expect(cardList).toBeInTheDocument();

    const cards = container.querySelectorAll(".card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveTextContent("First Task");
    expect(cards[1]).toHaveTextContent("Second Task");
  });

  it("renders AddCardForm at bottom of column", () => {
    const { container } = render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    const addCardForm = container.querySelector(".add-card-form");
    expect(addCardForm).toBeInTheDocument();

    const column = container.querySelector(".column");
    expect(column).toBeInTheDocument();

    const children = column?.children;
    expect(children?.length).toBeGreaterThan(0);

    const lastChild = children?.item(children?.length - 1);
    expect(lastChild?.className).toContain("add-card-form");
  });

  it("renders column header with title and rename button", () => {
    const { container } = render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    const header = container.querySelector(".column-header");
    expect(header).toBeInTheDocument();

    expect(header?.querySelector(".column-title")).toBeInTheDocument();
    expect(header?.querySelector(".rename-button")).toBeInTheDocument();
  });

  it("renders all card details correctly", () => {
    render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    expect(screen.getByText("Details for first task")).toBeInTheDocument();
    expect(screen.getByText("Details for second task")).toBeInTheDocument();
  });

  it("has semantic section structure", () => {
    const { container } = render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    expect(container.querySelector("section")).toBeInTheDocument();
  });

  it("has semantic list for cards", () => {
    const { container } = render(
      <Column
        column={mockColumn}
        cardsById={mockCards}
        onRename={vi.fn()}
        onAddCard={vi.fn()}
        onDeleteCard={vi.fn()}
      />
    );

    const list = container.querySelector("ul");
    expect(list).toBeInTheDocument();
    expect(list?.classList.contains("card-list")).toBe(true);
  });
});
