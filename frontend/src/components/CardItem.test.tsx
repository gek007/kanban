import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import { CardItem } from "./CardItem";
import type { Card } from "@/types/kanban";

const mockCard: Card = {
  id: "task-1",
  title: "Test Task",
  details: "Test details for the task",
};

describe("CardItem", () => {
  it("renders card with title and details", () => {
    render(<CardItem card={mockCard} columnId="col-1" onDelete={vi.fn()} />);

    expect(screen.getByText("Test Task")).toBeInTheDocument();
    expect(screen.getByText("Test details for the task")).toBeInTheDocument();
  });

  it("renders card with empty details", () => {
    const cardWithEmptyDetails: Card = {
      id: "task-2",
      title: "Task without details",
      details: "",
    };

    const { container } = render(
      <CardItem card={cardWithEmptyDetails} columnId="col-1" onDelete={vi.fn()} />
    );

    expect(screen.getByText("Task without details")).toBeInTheDocument();
    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toBe("");
  });

  it("renders delete button", () => {
    render(<CardItem card={mockCard} columnId="col-1" onDelete={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls onDelete when delete button is clicked", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<CardItem card={mockCard} columnId="col-1" onDelete={onDelete} />);

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(onDelete).toHaveBeenCalledWith("col-1", "task-1");
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("has correct data-testid attribute", () => {
    render(<CardItem card={mockCard} columnId="col-1" onDelete={vi.fn()} />);

    expect(screen.getByTestId("card-task-1")).toBeInTheDocument();
  });

  it("renders with correct CSS class for dragging state", () => {
    const { container } = render(
      <CardItem card={mockCard} columnId="col-1" onDelete={vi.fn()} />
    );

    const card = container.querySelector(".card");
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass("card");
  });

  it("renders with long title truncation expected", () => {
    const longCard: Card = {
      id: "task-long",
      title: "This is a very long title that should be handled appropriately by the component",
      details: "Short details",
    };

    render(<CardItem card={longCard} columnId="col-1" onDelete={vi.fn()} />);

    expect(screen.getByText(longCard.title)).toBeInTheDocument();
  });

  it("renders with long details", () => {
    const longDetailsCard: Card = {
      id: "task-long-details",
      title: "Short Title",
      details: "This is a very long detail text that contains a lot of information about the task. ".repeat(5),
    };

    const { container } = render(
      <CardItem card={longDetailsCard} columnId="col-1" onDelete={vi.fn()} />
    );

    const paragraph = container.querySelector("p");
    expect(paragraph).toBeInTheDocument();
    expect(paragraph?.textContent).toBe(longDetailsCard.details);
  });

  it("handles special characters in title and details", () => {
    const specialCard: Card = {
      id: "task-special",
      title: "Task with <special> & \"characters\"",
      details: "Details with 'quotes' and \n newlines",
    };

    render(<CardItem card={specialCard} columnId="col-1" onDelete={vi.fn()} />);

    expect(screen.getByText("Task with <special> & \"characters\"")).toBeInTheDocument();
  });

  it("delete button has correct test-id", () => {
    render(<CardItem card={mockCard} columnId="col-1" onDelete={vi.fn()} />);

    expect(screen.getByTestId("delete-card-task-1")).toBeInTheDocument();
  });

  it("card has semantic list item structure", () => {
    const { container } = render(
      <CardItem card={mockCard} columnId="col-1" onDelete={vi.fn()} />
    );

    expect(container.querySelector("li")).toBeInTheDocument();
  });

  it("renders with proper heading hierarchy", () => {
    const { container } = render(
      <CardItem card={mockCard} columnId="col-1" onDelete={vi.fn()} />
    );

    const heading = container.querySelector("h4");
    expect(heading).toBeInTheDocument();
    expect(heading?.textContent).toBe("Test Task");
  });
});
