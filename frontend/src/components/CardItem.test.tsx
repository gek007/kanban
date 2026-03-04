import { render, screen } from "@testing-library/react";
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

  it("fires delete handler", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CardItem card={mockCard} columnId="col-1" onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith("col-1", "task-1");
  });
});
