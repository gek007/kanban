import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HomePage from "./page";
import { AnnouncementProvider } from "@/hooks/useAnnouncement";

// Wrapper function to provide the announcement context
function PageWrapper({ children }: { children: React.ReactNode }) {
  return <AnnouncementProvider>{children}</AnnouncementProvider>;
}

describe("kanban page", () => {
  beforeEach(() => {
    // Clear localStorage before each test to ensure fresh state
    localStorage.clear();
  });

  it("renders seeded columns and cards", () => {
    render(<HomePage />, { wrapper: PageWrapper });
    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByText("Ready")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Define release scope")).toBeInTheDocument();
  });

  it("renames a column with enter", async () => {
    const user = userEvent.setup();
    render(<HomePage />, { wrapper: PageWrapper });
    await user.click(screen.getByTestId("rename-column-col-1"));
    const input = screen.getByTestId("rename-input-col-1");
    await user.clear(input);
    await user.type(input, "Ideas{Enter}");
    expect(screen.getByText("Ideas")).toBeInTheDocument();
  });

  it("validates and adds a card", async () => {
    const user = userEvent.setup();
    render(<HomePage />, { wrapper: PageWrapper });

    await user.click(screen.getByTestId("add-submit-col-1"));
    expect(screen.getByText("Card title is required.")).toBeInTheDocument();

    await user.type(screen.getByTestId("add-title-col-1"), "Ship MVP board");
    await user.type(screen.getByTestId("add-details-col-1"), "Finalize interactions");
    await user.click(screen.getByTestId("add-submit-col-1"));

    expect(screen.getByText("Ship MVP board")).toBeInTheDocument();
  });

  it("deletes a card from the board after confirmation", async () => {
    const user = userEvent.setup();
    render(<HomePage />, { wrapper: PageWrapper });

    const deleteButton = screen.getByTestId("delete-card-task-1");
    await user.click(deleteButton);

    // Confirm the dialog
    const confirmButton = screen.getByTestId("dialog-confirm-button");
    await user.click(confirmButton);

    expect(screen.queryByText("Define release scope")).not.toBeInTheDocument();
  });
});

