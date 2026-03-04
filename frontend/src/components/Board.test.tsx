import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import { Board } from "./Board";
import { seedBoard } from "@/data/seedBoard";

describe("Board", () => {
  it("renders all columns from seed data", () => {
    render(<Board />);

    expect(screen.getByTestId("column-col-1")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-2")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-3")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-4")).toBeInTheDocument();
    expect(screen.getByTestId("column-col-5")).toBeInTheDocument();
  });

  it("renders seeded cards in correct columns", () => {
    render(<Board />);

    const column1 = screen.getByTestId("column-col-1");
    expect(column1).toHaveTextContent("Define release scope");
    expect(column1).toHaveTextContent("Sketch onboarding");

    const column2 = screen.getByTestId("column-col-2");
    expect(column2).toHaveTextContent("Write acceptance checks");

    const column3 = screen.getByTestId("column-col-3");
    expect(column3).toHaveTextContent("Implement board reducer");
    expect(column3).toHaveTextContent("Refine card visual style");
  });

  it("renders with correct board test-id", () => {
    render(<Board />);

    expect(screen.getByTestId("board")).toBeInTheDocument();
  });

  it("handles column rename action", async () => {
    const user = userEvent.setup();
    render(<Board />);

    await user.click(screen.getByTestId("rename-column-col-1"));
    const input = screen.getByTestId("rename-input-col-1");
    await user.clear(input);
    await user.type(input, "Ideas{Enter}");

    expect(screen.getByText("Ideas")).toBeInTheDocument();
  });

  it("handles add card action", async () => {
    const user = userEvent.setup();
    render(<Board />);

    await user.type(screen.getByTestId("add-title-col-1"), "New Task");
    await user.click(screen.getByTestId("add-submit-col-1"));

    expect(screen.getByText("New Task")).toBeInTheDocument();
  });

  it("handles delete card action", async () => {
    const user = userEvent.setup();
    render(<Board />);

    const deleteButton = screen.getByTestId("delete-card-task-1");
    await user.click(deleteButton);

    expect(screen.queryByText("Define release scope")).not.toBeInTheDocument();
  });

  it("initializes with seed board state", () => {
    render(<Board />);

    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("has correct grid layout structure", () => {
    const { container } = render(<Board />);

    expect(container.querySelector(".board-wrapper")).toBeInTheDocument();
    expect(container.querySelector(".board-grid")).toBeInTheDocument();

    const grid = container.querySelector(".board-grid");
    expect(grid?.children.length).toBe(5);
  });

  it("maintains column order from seed data", () => {
    const { container } = render(<Board />);

    const grid = container.querySelector(".board-grid");
    const columns = grid?.querySelectorAll(".column");

    expect(columns?.length).toBe(5);

    const firstColumn = columns?.[0];
    expect(firstColumn?.getAttribute("data-testid")).toBe("column-col-1");

    const lastColumn = columns?.[4];
    expect(lastColumn?.getAttribute("data-testid")).toBe("column-col-5");
  });

  it("all columns have add card forms", () => {
    render(<Board />);

    expect(screen.getByTestId("add-submit-col-1")).toBeInTheDocument();
    expect(screen.getByTestId("add-submit-col-2")).toBeInTheDocument();
    expect(screen.getByTestId("add-submit-col-3")).toBeInTheDocument();
    expect(screen.getByTestId("add-submit-col-4")).toBeInTheDocument();
    expect(screen.getByTestId("add-submit-col-5")).toBeInTheDocument();
  });

  it("all columns have rename buttons", () => {
    render(<Board />);

    expect(screen.getByTestId("rename-column-col-1")).toBeInTheDocument();
    expect(screen.getByTestId("rename-column-col-2")).toBeInTheDocument();
    expect(screen.getByTestId("rename-column-col-3")).toBeInTheDocument();
    expect(screen.getByTestId("rename-column-col-4")).toBeInTheDocument();
    expect(screen.getByTestId("rename-column-col-5")).toBeInTheDocument();
  });

  it("renders with DndContext wrapper", () => {
    const { container } = render(<Board />);

    const boardWrapper = container.querySelector(".board-wrapper");
    expect(boardWrapper).toBeInTheDocument();
  });

  it("cards have correct test-ids for drag and drop", () => {
    render(<Board />);

    expect(screen.getByTestId("card-task-1")).toBeInTheDocument();
    expect(screen.getByTestId("card-task-2")).toBeInTheDocument();
    expect(screen.getByTestId("card-task-3")).toBeInTheDocument();
    expect(screen.getByTestId("card-task-4")).toBeInTheDocument();
  });

  it("handles multiple card additions in same column", async () => {
    const user = userEvent.setup();
    render(<Board />);

    const column1Title = screen.getByTestId("add-title-col-1");
    const submitButton = screen.getByTestId("add-submit-col-1");

    await user.type(column1Title, "First Task");
    await user.click(submitButton);

    await user.type(column1Title, "Second Task");
    await user.click(submitButton);

    expect(screen.getByText("First Task")).toBeInTheDocument();
    expect(screen.getByText("Second Task")).toBeInTheDocument();
  });

  it("handles card deletion from different columns", async () => {
    const user = userEvent.setup();
    render(<Board />);

    await user.click(screen.getByTestId("delete-card-task-1"));
    expect(screen.queryByText("Define release scope")).not.toBeInTheDocument();

    await user.click(screen.getByTestId("delete-card-task-3"));
    expect(screen.queryByText("Write acceptance checks")).not.toBeInTheDocument();
  });

  it("validates empty card title on add", async () => {
    const user = userEvent.setup();
    render(<Board />);

    await user.click(screen.getByTestId("add-submit-col-1"));

    expect(screen.getByText("Card title is required.")).toBeInTheDocument();
  });
});
