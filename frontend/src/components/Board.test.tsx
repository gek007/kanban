import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Board } from "./Board";
import { AnnouncementProvider } from "@/hooks/useAnnouncement";

// Wrapper function to provide the announcement context
function BoardWrapper({ children }: { children: React.ReactNode }) {
  return <AnnouncementProvider>{children}</AnnouncementProvider>;
}

describe("Board", () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure fresh state
    localStorage.clear();
  });

  it("renders the seeded board", () => {
    render(<Board />, { wrapper: BoardWrapper });

    ["Backlog", "Ready", "In Progress", "Review", "Done"].forEach((column) => {
      expect(screen.getByRole("heading", { level: 2, name: column })).toBeInTheDocument();
    });

    expect(screen.getByText("Define release scope")).toBeInTheDocument();
    expect(screen.getByText("Implement board reducer")).toBeInTheDocument();
  });

  it("allows renaming a column and blocks empty titles", async () => {
    const user = userEvent.setup();
    render(<Board />, { wrapper: BoardWrapper });

    const backlogSection = screen
      .getByRole("heading", { level: 2, name: "Backlog" })
      .closest("section");
    const renameButton = within(backlogSection as HTMLElement).getByRole("button", {
      name: "Rename",
    });

    await user.click(renameButton);
    const input = within(backlogSection as HTMLElement).getByRole("textbox", {
      name: /rename backlog/i,
    });

    await user.clear(input);
    await user.keyboard("{Enter}");
    expect(screen.getByText("Column title cannot be empty.")).toBeInTheDocument();
    expect(input).toHaveFocus();

    await user.type(input, "Ideas{Enter}");
    expect(screen.getByRole("heading", { name: "Ideas" })).toBeInTheDocument();
    expect(screen.queryByText("Column title cannot be empty.")).not.toBeInTheDocument();
  });

  it("validates and adds cards", async () => {
    const user = userEvent.setup();
    render(<Board />, { wrapper: BoardWrapper });

    const backlogSection = screen
      .getByRole("heading", { level: 2, name: "Backlog" })
      .closest("section");
    const addButton = within(backlogSection as HTMLElement).getByRole("button", {
      name: "Add Card",
    });
    await user.click(addButton);
    expect(screen.getByText("Card title is required.")).toBeInTheDocument();

    const titleInput = within(backlogSection as HTMLElement).getByRole("textbox", {
      name: /add card/i,
    });
    await user.type(titleInput, "Ship MVP board");
    await user.click(addButton);

    expect(screen.queryByText("Card title is required.")).not.toBeInTheDocument();
    expect(screen.getByText("Ship MVP board")).toBeInTheDocument();
  });

  it("removes a card from the board after confirmation", async () => {
    const user = userEvent.setup();
    render(<Board />, { wrapper: BoardWrapper });

    const card = screen.getByText("Define release scope").closest("li");
    const deleteButton = within(card as HTMLElement).getByRole("button", { name: /delete/i });
    await user.click(deleteButton);

    // Confirm the dialog
    const confirmButton = screen.getByTestId("dialog-confirm-button");
    await user.click(confirmButton);

    expect(screen.queryByText("Define release scope")).not.toBeInTheDocument();
  });

  it("appends multiple cards to the same column", async () => {
    const user = userEvent.setup();
    render(<Board />, { wrapper: BoardWrapper });

    const column = screen.getByRole("heading", { level: 2, name: "Backlog" }).closest("section");
    const titleInput = within(column as HTMLElement).getByRole("textbox", { name: /add card/i });
    const submit = within(column as HTMLElement).getByRole("button", { name: "Add Card" });

    await user.type(titleInput, "First Task");
    await user.click(submit);
    await user.type(titleInput, "Second Task");
    await user.click(submit);

    const cards = within(column as HTMLElement).getAllByRole("heading", { level: 4 });
    expect(cards.map((node) => node.textContent)).toEqual(
      expect.arrayContaining(["First Task", "Second Task"])
    );
  });
});
