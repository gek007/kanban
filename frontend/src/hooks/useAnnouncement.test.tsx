/**
 * Tests for the useAnnouncement hook
 */

import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AnnouncementProvider, useAnnouncement, formatAnnouncement } from "@/hooks/useAnnouncement";

describe("useAnnouncement", () => {
  describe("formatAnnouncement", () => {
    it("should format card-added announcements", () => {
      const message = formatAnnouncement("card-added", {
        cardTitle: "Test Task",
        columnName: "Backlog",
      });
      expect(message).toBe('Card "Test Task" added to Backlog');
    });

    it("should format card-deleted announcements", () => {
      const message = formatAnnouncement("card-deleted", {
        cardTitle: "Test Task",
        columnName: "Done",
      });
      expect(message).toBe('Card "Test Task" deleted from Done');
    });

    it("should format column-renamed announcements", () => {
      const message = formatAnnouncement("column-renamed", {
        oldName: "Backlog",
        newName: "Icebox",
      });
      expect(message).toBe('Column renamed from "Backlog" to "Icebox"');
    });

    it("should format card-moved announcements within same column", () => {
      const message = formatAnnouncement("card-moved", {
        cardTitle: "Test Task",
        fromColumn: "In Progress",
        toColumn: "In Progress",
        columnName: "In Progress",
      });
      expect(message).toBe('Card "Test Task" reordered within In Progress');
    });

    it("should format card-moved announcements across columns", () => {
      const message = formatAnnouncement("card-moved", {
        cardTitle: "Test Task",
        fromColumn: "Backlog",
        toColumn: "Ready",
      });
      expect(message).toBe('Card "Test Task" moved from Backlog to Ready');
    });

    it("should format info announcements with card title", () => {
      const message = formatAnnouncement("info", {
        cardTitle: "Test Task",
      });
      expect(message).toBe("Test Task");
    });

    it("should format info announcements with column name", () => {
      const message = formatAnnouncement("info", {
        columnName: "Backlog",
      });
      expect(message).toBe("Backlog");
    });

    it("should default info announcements to generic message", () => {
      const message = formatAnnouncement("info", {});
      expect(message).toBe("Action completed");
    });
  });

  describe("useAnnouncement hook", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useAnnouncement());
      }).toThrow("useAnnouncement must be used within an AnnouncementProvider");

      console.error = originalError;
    });

    it("should provide announce function when used within provider", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AnnouncementProvider>{children}</AnnouncementProvider>
      );

      const { result } = renderHook(() => useAnnouncement(), { wrapper });

      expect(result.current.announce).toBeDefined();
      expect(typeof result.current.announce).toBe("function");
    });

    it("should not throw when calling announce", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AnnouncementProvider>{children}</AnnouncementProvider>
      );

      const { result } = renderHook(() => useAnnouncement(), { wrapper });

      expect(() => {
        act(() => {
          result.current.announce("Test announcement");
        });
      }).not.toThrow();
    });

    it("should handle different announcement types", () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <AnnouncementProvider>{children}</AnnouncementProvider>
      );

      const { result } = renderHook(() => useAnnouncement(), { wrapper });

      expect(() => {
        act(() => {
          result.current.announce("Card added", "card-added");
          result.current.announce("Card deleted", "card-deleted");
          result.current.announce("Column renamed", "column-renamed");
          result.current.announce("Card moved", "card-moved");
          result.current.announce("Info", "info");
        });
      }).not.toThrow();
    });
  });
});
