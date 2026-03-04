import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EditableColumnTitle } from "./EditableColumnTitle";

describe("EditableColumnTitle", () => {
  it("renders column title and rename button", () => {
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={vi.fn()} />);

    expect(screen.getByText("Backlog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rename" })).toBeInTheDocument();
  });

  it("enters edit mode when rename button is clicked", async () => {
    const user = userEvent.setup();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));

    const input = screen.getByRole("textbox", { name: /rename/i });
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("Backlog");
    expect(input).toHaveFocus();
  });

  it("saves new title on Enter key", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename backlog/i });

    await user.clear(input);
    await user.type(input, "Ideas");
    await user.keyboard("{Enter}");

    expect(onSave).toHaveBeenCalledWith("Ideas");
  });

  it("cancels edit on Escape key", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename/i });

    await user.clear(input);
    await user.type(input, "Ideas");
    await user.keyboard("{Escape}");

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText("Backlog")).toBeInTheDocument();
  });

  it("saves on blur", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename backlog/i });

    await user.clear(input);
    await user.type(input, "Ideas");
    input.blur();

    expect(onSave).toHaveBeenCalledWith("Ideas");
  });

  it("updates draft when value prop changes", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const { rerender } = render(
      <EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />
    );

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename/i });
    expect(input).toHaveValue("Backlog");

    rerender(<EditableColumnTitle columnId="col-1" value="New Name" onSave={onSave} />);

    expect(input).toHaveValue("New Name");
  });

  it("has correct accessibility attributes", () => {
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={vi.fn()} />);

    expect(screen.getByTestId("column-title-col-1")).toBeInTheDocument();
    expect(screen.getByTestId("rename-column-col-1")).toBeInTheDocument();
  });

  it("allows empty string as new title", async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<EditableColumnTitle columnId="col-1" value="Backlog" onSave={onSave} />);

    await user.click(screen.getByRole("button", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: /rename/i });

    await user.clear(input);
    await user.type(input, "{Enter}");

    expect(onSave).toHaveBeenCalledWith("");
  });
});
