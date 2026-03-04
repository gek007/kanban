import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, vi } from "vitest";
import { AddCardForm } from "./AddCardForm";

describe("AddCardForm", () => {
  it("renders form inputs and submit button", () => {
    render(<AddCardForm columnId="col-1" onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/add card/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Title")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Details")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add Card" })).toBeInTheDocument();
  });

  it("submits card with title and details", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddCardForm columnId="col-1" onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("Title"), "New Task");
    await user.type(screen.getByPlaceholderText("Details"), "Task details");
    await user.click(screen.getByRole("button", { name: "Add Card" }));

    expect(onSubmit).toHaveBeenCalledWith("New Task", "Task details");
  });

  it("shows error when title is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddCardForm columnId="col-1" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Add Card" }));

    expect(screen.getByText("Card title is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("shows error when title contains only whitespace", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddCardForm columnId="col-1" onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("Title"), "   ");
    await user.click(screen.getByRole("button", { name: "Add Card" }));

    expect(screen.getByText("Card title is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("clears form after successful submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddCardForm columnId="col-1" onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText("Title");
    const detailsInput = screen.getByPlaceholderText("Details");

    await user.type(titleInput, "New Task");
    await user.type(detailsInput, "Task details");
    await user.click(screen.getByRole("button", { name: "Add Card" }));

    expect(titleInput).toHaveValue("");
    expect(detailsInput).toHaveValue("");
    expect(screen.queryByText("Card title is required.")).not.toBeInTheDocument();
  });

  it("submits when pressing Enter in title input", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddCardForm columnId="col-1" onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText("Title");
    await user.type(titleInput, "New Task{Enter}");

    expect(onSubmit).toHaveBeenCalledWith("New Task", "");
  });

  it("does not submit form from textarea enter key", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddCardForm columnId="col-1" onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText("Title");
    const detailsInput = screen.getByPlaceholderText("Details");

    await user.type(titleInput, "New Task");
    await user.type(detailsInput, "Line 1{Enter}Line 2");

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("has maxlength attributes on inputs", () => {
    render(<AddCardForm columnId="col-1" onSubmit={vi.fn()} />);

    const titleInput = screen.getByPlaceholderText("Title") as HTMLInputElement;
    const detailsInput = screen.getByPlaceholderText("Details") as HTMLTextAreaElement;

    expect(titleInput.maxLength).toBe(120);
    expect(detailsInput.maxLength).toBe(500);
  });

  it("has correct test ids for inputs and button", () => {
    render(<AddCardForm columnId="col-2" onSubmit={vi.fn()} />);

    expect(screen.getByTestId("add-title-col-2")).toBeInTheDocument();
    expect(screen.getByTestId("add-details-col-2")).toBeInTheDocument();
    expect(screen.getByTestId("add-submit-col-2")).toBeInTheDocument();
  });

  it("submits with empty details field", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AddCardForm columnId="col-1" onSubmit={onSubmit} />);

    const titleInput = screen.getByPlaceholderText("Title");
    await user.type(titleInput, "Title only");
    await user.click(screen.getByRole("button", { name: "Add Card" }));

    expect(onSubmit).toHaveBeenCalled();
    const callArgs = onSubmit.mock.calls[0];
    expect(callArgs?.[0]).toBe("Title only");
    expect(callArgs?.[1]).toBe("");
  });
});
