"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

/**
 * Props for the ErrorBoundary component
 */
interface ErrorBoundaryProps {
  /** Children to be wrapped by the error boundary */
  children: ReactNode;
  /** Custom fallback component to render when an error occurs */
  fallback?: ReactNode;
  /** Callback when an error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

/**
 * State for the ErrorBoundary component
 */
interface ErrorBoundaryState {
  /** Whether an error has been caught */
  hasError: boolean;
  /** The error that was caught */
  error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 *
 * Features:
 * - Catches errors during rendering, in lifecycle methods, and in constructors
 * - Logs errors to console and optionally to a custom error handler
 * - Provides a user-friendly error message
 * - Allows recovery via page reload or reset
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error Info:", errorInfo);

    // Call the custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    // Clear localStorage and reload the page
    localStorage.clear();
    window.location.reload();
  };

  handleReload = () => {
    // Just reload the page
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1 className="error-title">Something went wrong</h1>
            <p className="error-message">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="error-details">
                <summary>Error details (development only)</summary>
                <pre className="error-stack">{this.state.error.toString()}</pre>
              </details>
            )}
            <div className="error-actions">
              <button
                type="button"
                className="error-button error-button-secondary"
                onClick={this.handleReset}
                aria-label="Reset application and clear saved data"
              >
                Reset Application
              </button>
              <button
                type="button"
                className="error-button error-button-primary"
                onClick={this.handleReload}
                aria-label="Reload the page"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
