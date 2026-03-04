import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableColumnTitle } from "./EditableColumnTitle";

describe("EditableColumnTitle", () => {
  it("shows the column name and rename control", () => {
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={vi.fn()} />);

    expect(screen.getByRole("heading", { level: 2, name: "Backlog" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rename" })).toBeInTheDocument();
  });

  it("enters edit mode and preserves the current value", async () => {
    const user = userEvent.setup();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));

    const input = screen.getByRole("textbox", { name: /rename backlog/i });
    expect(input).toHaveValue("Backlog");
    expect(input).toHaveFocus();
  });

  it("saves a trimmed name via Enter", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename backlog/i });

    await user.clear(input);
    await user.type(input, "  Ideas  ");
    await user.keyboard("{Enter}");

    expect(onSave).toHaveBeenCalledWith("Ideas");
  });

  it("rejects blank names and shows inline feedback", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename backlog/i });

    await user.clear(input);
    await user.keyboard("{Enter}");

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Column title cannot be empty.")).toBeInTheDocument();
    expect(input).toHaveFocus();
  });

  it("clears validation once a valid title is provided", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename backlog/i });

    await user.clear(input);
    await user.keyboard("{Enter}");
    expect(screen.getByText("Column title cannot be empty.")).toBeInTheDocument();

    await user.type(input, "Ideas{Enter}");
    expect(onSave).toHaveBeenCalledWith("Ideas");
    expect(screen.queryByText("Column title cannot be empty.")).not.toBeInTheDocument();
  });

  it("cancels edits with Escape", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename backlog/i });

    await user.type(input, "Ideas");
    await user.keyboard("{Escape}");

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Backlog" })).toBeInTheDocument();
  });
});
