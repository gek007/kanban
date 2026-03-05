"use client";

import { createContext, useContext, useRef, useState, useCallback, type ReactNode } from "react";

/**
 * Announcement types for different actions
 */
export type AnnouncementType =
  | "card-added"
  | "card-deleted"
  | "column-renamed"
  | "card-moved"
  | "info";

/**
 * Props for the announcement context value
 */
interface AnnouncementContextValue {
  /**
   * Announces a message to screen readers
   * @param message - The message to announce
   * @param type - The type of announcement (affects politeness level)
   */
  announce: (message: string, type?: AnnouncementType) => void;
}

/**
 * Props for the AnnouncementProvider component
 */
interface AnnouncementProviderProps {
  children: ReactNode;
}

const AnnouncementContext = createContext<AnnouncementContextValue | null>(null);

/**
 * Provider component that renders an ARIA live region for screen reader announcements.
 * Uses both assertive and polite regions for different types of announcements.
 */
export function AnnouncementProvider({ children }: AnnouncementProviderProps) {
  const [assertiveMessage, setAssertiveMessage] = useState<string>("");
  const [politeMessage, setPoliteMessage] = useState<string>("");

  // Refs to track when messages have been announced
  const assertiveRef = useRef<string>("");
  const politeRef = useRef<string>("");

  /**
   * Announces a message to screen readers
   * Uses "assertive" for deletions and "polite" for other updates
   */
  const announce = useCallback((message: string, type: AnnouncementType = "info") => {
    // Use assertive for deletions (higher priority), polite for everything else
    const isAssertive = type === "card-deleted";

    if (isAssertive) {
      // Clear and reset to trigger re-announcement for same message
      setAssertiveMessage("");
      requestAnimationFrame(() => {
        setAssertiveMessage(message);
      });
    } else {
      // Clear and reset to trigger re-announcement for same message
      setPoliteMessage("");
      requestAnimationFrame(() => {
        setPoliteMessage(message);
      });
    }
  }, []);

  return (
    <AnnouncementContext.Provider value={{ announce }}>
      {children}
      {/* Assertive live region for high-priority announcements like deletions */}
      <div
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
        ref={(node) => {
          if (node && assertiveMessage && assertiveRef.current !== assertiveMessage) {
            assertiveRef.current = assertiveMessage;
            // Clear after announcement to allow re-announcing same message
            setTimeout(() => {
              assertiveRef.current = "";
              setAssertiveMessage("");
            }, 1000);
          }
        }}
      >
        {assertiveMessage}
      </div>
      {/* Polite live region for informational announcements */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        ref={(node) => {
          if (node && politeMessage && politeRef.current !== politeMessage) {
            politeRef.current = politeMessage;
            // Clear after announcement to allow re-announcing same message
            setTimeout(() => {
              politeRef.current = "";
              setPoliteMessage("");
            }, 1000);
          }
        }}
      >
        {politeMessage}
      </div>
    </AnnouncementContext.Provider>
  );
}

/**
 * Hook to access the announcement function
 * @throws Error if used outside of AnnouncementProvider
 * @returns The announce function
 */
export function useAnnouncement(): AnnouncementContextValue {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error("useAnnouncement must be used within an AnnouncementProvider");
  }
  return context;
}

/**
 * Helper function to create a formatted announcement message
 * @param type - The type of announcement
 * @param details - Details about the action
 * @returns A formatted announcement message
 */
export function formatAnnouncement(type: AnnouncementType, details: {
  cardTitle?: string;
  columnName?: string;
  oldName?: string;
  newName?: string;
  fromColumn?: string;
  toColumn?: string;
}): string {
  switch (type) {
    case "card-added":
      return `Card "${details.cardTitle}" added to ${details.columnName}`;
    case "card-deleted":
      return `Card "${details.cardTitle}" deleted from ${details.columnName}`;
    case "column-renamed":
      return `Column renamed from "${details.oldName}" to "${details.newName}"`;
    case "card-moved":
      if (details.fromColumn === details.toColumn) {
        return `Card "${details.cardTitle}" reordered within ${details.columnName}`;
      }
      return `Card "${details.cardTitle}" moved from ${details.fromColumn} to ${details.toColumn}`;
    case "info":
      return details.cardTitle ?? details.columnName ?? "Action completed";
    default:
      return "Action completed";
  }
}
