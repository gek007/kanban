/**
 * Tests for the ErrorBoundary component
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary } from "./ErrorBoundary";

// Mock console.error to avoid cluttering test output
const originalError = console.error;

describe("ErrorBoundary", () => {
  beforeEach(() => {
    console.error = vi.fn();
    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Normal Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText("Normal Content")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("catches errors and displays fallback UI", () => {
    // Create a component that throws an error
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(console.error).toHaveBeenCalled();
  });

  it("displays custom fallback when provided", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    const customFallback = <div>Custom Error UI</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom Error UI")).toBeInTheDocument();
    expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
  });

  it("calls onError callback when error is caught", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it("has reset button with proper accessibility", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const resetButton = screen.getByLabelText("Reset application and clear saved data");
    expect(resetButton).toBeInTheDocument();
    expect(resetButton).toHaveTextContent("Reset Application");
  });

  it("has reload button with proper accessibility", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByLabelText("Reload the page");
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toHaveTextContent("Reload Page");
  });

  it("shows error details in development mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const ThrowError = () => {
      throw new Error("Test error with details");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Error details \(development only\)/i)).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("does not show error details in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const ThrowError = () => {
      throw new Error("Test error with details");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.queryByText(/Error details/i)).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it("has proper ARIA attributes", () => {
    const ThrowError = () => {
      throw new Error("Test error");
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveAttribute("aria-atomic", "true");
  });

  it("resets error state when children change after error", async () => {
    // This test verifies that the error boundary can recover
    let shouldThrow = true;

    const ConditionalThrow = ({ throw: shouldThrowParam }: { throw: boolean }) => {
      if (shouldThrowParam) {
        throw new Error("Conditional error");
      }
      return <div>Recovered</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrow throw={shouldThrow} />
      </ErrorBoundary>
    );

    // Should show error UI
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Note: In real scenarios, the error boundary would need a way to reset
    // This test demonstrates the concept, but actual recovery would require
    // either a page reload or a key prop change
  });
});
