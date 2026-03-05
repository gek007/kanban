/**
 * Tests for localStorage persistence utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  loadBoardState,
  saveBoardState,
  clearBoardState,
  initializeBoardState,
  resetBoardState,
} from "@/utils/storage";
import { seedBoard } from "@/data/seedBoard";
import type { BoardState } from "@/types/kanban";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value.toString();
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("storage utilities", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("saveBoardState", () => {
    it("should save valid board state to localStorage", () => {
      const result = saveBoardState(seedBoard);
      expect(result).toBe(true);

      const stored = localStorage.getItem("kanban-board-state");
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.version).toBe(1);
      expect(parsed.state).toEqual(seedBoard);
    });

    it("should include version number in stored data", () => {
      saveBoardState(seedBoard);

      const stored = localStorage.getItem("kanban-board-state");
      const parsed = JSON.parse(stored!);

      expect(parsed).toHaveProperty("version");
      expect(parsed.version).toBe(1);
    });

    it("should handle storage errors gracefully", () => {
      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const result = saveBoardState(seedBoard);
      expect(result).toBe(false);

      localStorage.setItem = originalSetItem;
    });
  });

  describe("loadBoardState", () => {
    it("should return null when localStorage is empty", () => {
      const result = loadBoardState();
      expect(result).toBeNull();
    });

    it("should load and return valid stored state", () => {
      saveBoardState(seedBoard);
      const loaded = loadBoardState();

      expect(loaded).toEqual(seedBoard);
    });

    it("should handle versioned storage format", () => {
      const versionedData = {
        version: 1,
        state: seedBoard,
      };
      localStorage.setItem("kanban-board-state", JSON.stringify(versionedData));

      const loaded = loadBoardState();
      expect(loaded).toEqual(seedBoard);
    });

    it("should return null for invalid data and clear storage", () => {
      localStorage.setItem("kanban-board-state", "invalid json");

      const loaded = loadBoardState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem("kanban-board-state")).toBeNull();
    });

    it("should validate board state structure", () => {
      const invalidState = {
        version: 1,
        state: {
          ...seedBoard,
          columnOrder: ["col-1", "col-2"], // Invalid: only 2 columns
        },
      };
      localStorage.setItem("kanban-board-state", JSON.stringify(invalidState));

      const loaded = loadBoardState();
      expect(loaded).toBeNull();
      expect(localStorage.getItem("kanban-board-state")).toBeNull();
    });

    it("should handle missing cards gracefully", () => {
      const stateWithMissingCards: BoardState = {
        ...seedBoard,
        columns: {
          ...seedBoard.columns,
          "col-1": {
            ...seedBoard.columns["col-1"],
            cardIds: ["non-existent-card"],
          },
        },
        cards: {},
      };

      localStorage.setItem("kanban-board-state", JSON.stringify({ version: 1, state: stateWithMissingCards }));

      const loaded = loadBoardState();
      expect(loaded).toBeNull();
    });

    it("should handle parse errors gracefully", () => {
      localStorage.setItem("kanban-board-state", "{ broken json");

      const loaded = loadBoardState();
      expect(loaded).toBeNull();
    });
  });

  describe("clearBoardState", () => {
    it("should remove board state from localStorage", () => {
      saveBoardState(seedBoard);
      expect(localStorage.getItem("kanban-board-state")).toBeTruthy();

      const result = clearBoardState();
      expect(result).toBe(true);
      expect(localStorage.getItem("kanban-board-state")).toBeNull();
    });

    it("should return true even when storage is already empty", () => {
      const result = clearBoardState();
      expect(result).toBe(true);
    });

    it("should handle storage errors gracefully", () => {
      // Mock localStorage.removeItem to throw an error
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn(() => {
        throw new Error("Storage error");
      });

      const result = clearBoardState();
      expect(result).toBe(false);

      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe("initializeBoardState", () => {
    it("should return seed data when localStorage is empty", () => {
      const result = initializeBoardState();
      expect(result).toEqual(seedBoard);
    });

    it("should return stored state when available", () => {
      saveBoardState(seedBoard);

      const result = initializeBoardState();
      expect(result).toEqual(seedBoard);
    });

    it("should return seed data when stored data is invalid", () => {
      localStorage.setItem("kanban-board-state", "invalid data");

      const result = initializeBoardState();
      expect(result).toEqual(seedBoard);
    });
  });

  describe("resetBoardState", () => {
    it("should clear localStorage and return seed data", () => {
      saveBoardState(seedBoard);

      const result = resetBoardState();

      expect(result).toEqual(seedBoard);
      expect(localStorage.getItem("kanban-board-state")).toBeNull();
    });

    it("should return seed data even when localStorage is empty", () => {
      const result = resetBoardState();

      expect(result).toEqual(seedBoard);
    });
  });

  describe("state persistence across operations", () => {
    it("should preserve modified column names", () => {
      const modifiedState: BoardState = {
        ...seedBoard,
        columns: {
          ...seedBoard.columns,
          "col-1": {
            ...seedBoard.columns["col-1"],
            name: "Modified Name",
          },
        },
      };

      saveBoardState(modifiedState);
      const loaded = loadBoardState();

      expect(loaded?.columns["col-1"].name).toBe("Modified Name");
    });

    it("should preserve added cards", () => {
      const stateWithNewCard: BoardState = {
        ...seedBoard,
        cards: {
          ...seedBoard.cards,
          "task-new": {
            id: "task-new",
            title: "New Task",
            details: "New task details",
          },
        },
        columns: {
          ...seedBoard.columns,
          "col-1": {
            ...seedBoard.columns["col-1"],
            cardIds: [...seedBoard.columns["col-1"].cardIds, "task-new"],
          },
        },
      };

      saveBoardState(stateWithNewCard);
      const loaded = loadBoardState();

      expect(loaded?.cards["task-new"]).toEqual({
        id: "task-new",
        title: "New Task",
        details: "New task details",
      });
      expect(loaded?.columns["col-1"].cardIds).toContain("task-new");
    });

    it("should preserve deleted cards", () => {
      const stateWithoutCard: BoardState = {
        ...seedBoard,
        cards: {
          ...seedBoard.cards,
        },
        columns: {
          ...seedBoard.columns,
          "col-1": {
            ...seedBoard.columns["col-1"],
            cardIds: seedBoard.columns["col-1"].cardIds.filter((id) => id !== "task-1"),
          },
        },
      };
      delete stateWithoutCard.cards["task-1"];

      saveBoardState(stateWithoutCard);
      const loaded = loadBoardState();

      expect(loaded?.cards["task-1"]).toBeUndefined();
      expect(loaded?.columns["col-1"].cardIds).not.toContain("task-1");
    });

    it("should preserve moved cards", () => {
      const stateWithMovedCard: BoardState = {
        ...seedBoard,
        columns: {
          ...seedBoard.columns,
          "col-1": {
            ...seedBoard.columns["col-1"],
            cardIds: seedBoard.columns["col-1"].cardIds.filter((id) => id !== "task-1"),
          },
          "col-2": {
            ...seedBoard.columns["col-2"],
            cardIds: [...seedBoard.columns["col-2"].cardIds, "task-1"],
          },
        },
      };

      saveBoardState(stateWithMovedCard);
      const loaded = loadBoardState();

      expect(loaded?.columns["col-1"].cardIds).not.toContain("task-1");
      expect(loaded?.columns["col-2"].cardIds).toContain("task-1");
    });
  });
});
