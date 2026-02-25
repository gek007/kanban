import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "./page";

describe("kanban page", () => {
  it("renders seeded columns and cards", () => {
    render(<HomePage />);
    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Define release scope")).toBeInTheDocument();
  });

  it("renames a column with enter", async () => {
    const user = userEvent.setup();
    render(<HomePage />);
    await user.click(screen.getByTestId("rename-column-col-1"));
    const input = screen.getByTestId("rename-input-col-1");
    await user.clear(input);
    await user.type(input, "Ideas{Enter}");
    expect(screen.getByText("Ideas")).toBeInTheDocument();
  });

  it("validates and adds a card", async () => {
    const user = userEvent.setup();
    render(<HomePage />);

    await user.click(screen.getByTestId("add-submit-col-1"));
    expect(screen.getByText("Card title is required.")).toBeInTheDocument();

    await user.type(screen.getByTestId("add-title-col-1"), "Ship MVP board");
    await user.type(screen.getByTestId("add-details-col-1"), "Finalize interactions");
    await user.click(screen.getByTestId("add-submit-col-1"));

    expect(screen.getByText("Ship MVP board")).toBeInTheDocument();
  });

  it("deletes a card from the board", () => {
    render(<HomePage />);
    const deleteButton = screen.getByTestId("delete-card-task-1");
    fireEvent.click(deleteButton);
    expect(screen.queryByText("Define release scope")).not.toBeInTheDocument();
  });
});

