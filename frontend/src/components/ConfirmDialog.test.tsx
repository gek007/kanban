/**
 * Tests for the ConfirmDialog component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  let onConfirm: ReturnType<typeof vi.fn>;
  let onCancel: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onConfirm = vi.fn();
    onCancel = vi.fn();
  });

  it("renders when open", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("calls onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const confirmButton = screen.getByTestId("dialog-confirm-button");
    await user.click(confirmButton);

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByTestId("dialog-cancel-button");
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onCancel when Escape key is pressed", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const dialog = screen.getByRole("dialog");
    await user.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("calls onCancel when backdrop is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const overlay = screen.getByTestId("confirm-dialog-overlay");
    await user.click(overlay);

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("uses custom button texts", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        confirmText="Yes, delete it"
        cancelText="No, keep it"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(screen.getByText("Yes, delete it")).toBeInTheDocument();
    expect(screen.getByText("No, keep it")).toBeInTheDocument();
  });

  it("renders with danger variant styling", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
        variant="danger"
      />
    );

    const confirmButton = screen.getByTestId("dialog-confirm-button");
    expect(confirmButton).toHaveClass("dialog-button-danger");
  });

  it("renders with default variant styling", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
        variant="default"
      />
    );

    const confirmButton = screen.getByTestId("dialog-confirm-button");
    expect(confirmButton).toHaveClass("dialog-button-primary");
  });

  it("has proper ARIA attributes", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "dialog-title");
    expect(dialog).toHaveAttribute("aria-describedby", "dialog-description");

    const title = screen.getByTestId("dialog-title");
    expect(title.id).toBe("dialog-title");

    const message = screen.getByTestId("dialog-message");
    expect(message.id).toBe("dialog-description");
  });

  it("focuses confirm button when opened", async () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const confirmButton = screen.getByTestId("dialog-confirm-button");
    await waitFor(() => {
      expect(confirmButton).toHaveFocus();
    });
  });

  it("handles Tab key focus trap", async () => {
    const user = userEvent.setup();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    const confirmButton = screen.getByTestId("dialog-confirm-button");
    const cancelButton = screen.getByTestId("dialog-cancel-button");

    // Tab should move from confirm to cancel
    await user.tab();
    expect(cancelButton).toHaveFocus();

    // Tab should move back to confirm (focus trap)
    await user.tab();
    expect(confirmButton).toHaveFocus();
  });

  it("prevents body scroll when open", () => {
    const { unmount } = render(
      <ConfirmDialog
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();
    expect(document.body.style.overflow).toBe("");
  });
});
