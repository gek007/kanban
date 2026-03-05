import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { CardItem } from "./CardItem";
import type { Card } from "@/types/kanban";

const mockCard: Card = {
  id: "task-1",
  title: "Test Task",
  details: "Test details",
};

describe("CardItem", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it("displays the provided content", () => {
    render(<CardItem card={mockCard} columnId="col-1" onDelete={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 4, name: "Test Task" })).toBeInTheDocument();
    expect(screen.getByText("Test details")).toBeInTheDocument();
  });

  it("handles empty detail text", () => {
    const card: Card = { id: "task-2", title: "No details", details: "" };
    render(<CardItem card={card} columnId="col-1" onDelete={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 4, name: "No details" })).toBeInTheDocument();
  });

  it("opens confirmation dialog when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CardItem card={mockCard} columnId="col-1" onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete Test Task" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Card")).toBeInTheDocument();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("fires delete handler after confirming dialog", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CardItem card={mockCard} columnId="col-1" onDelete={onDelete} />);

    // Click delete button to open dialog
    await user.click(screen.getByRole("button", { name: "Delete Test Task" }));

    // Click confirm button
    await user.click(screen.getByTestId("dialog-confirm-button"));

    expect(onDelete).toHaveBeenCalledWith("col-1", "task-1");
  });

  it("does not fire delete handler when cancelling dialog", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CardItem card={mockCard} columnId="col-1" onDelete={onDelete} />);

    // Click delete button to open dialog
    await user.click(screen.getByRole("button", { name: "Delete Test Task" }));

    // Click cancel button
    await user.click(screen.getByTestId("dialog-cancel-button"));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes dialog when Escape is pressed", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CardItem card={mockCard} columnId="col-1" onDelete={onDelete} />);

    // Click delete button to open dialog
    await user.click(screen.getByRole("button", { name: "Delete Test Task" }));

    // Press Escape
    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(onDelete).not.toHaveBeenCalled();
  });
});
