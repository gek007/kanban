import type { BoardState } from "@/types/kanban";
import { seedBoard } from "@/data/seedBoard";

/**
 * Storage key for persisting board state in localStorage
 */
const STORAGE_KEY = "kanban-board-state";

/**
 * Maximum storage version (for future migrations)
 */
const CURRENT_VERSION = 1;

/**
 * Stored board state with versioning for future migrations
 */
interface StoredBoardState {
  version: number;
  state: BoardState;
}

/**
 * Validates if an object has the basic structure of a BoardState
 * @param data - The data to validate
 * @returns true if the data appears to be a valid BoardState
 */
function isValidBoardState(data: unknown): data is BoardState {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const state = data as Record<string, unknown>;

  // Check for required top-level properties
  if (!Array.isArray(state.columnOrder) || typeof state.columns !== "object" || typeof state.cards !== "object") {
    return false;
  }

  // Validate columnOrder has exactly 5 columns
  if (state.columnOrder.length !== 5) {
    return false;
  }

  // Validate all column IDs are valid
  const validColumnIds = ["col-1", "col-2", "col-3", "col-4", "col-5"];
  for (const colId of state.columnOrder) {
    if (!validColumnIds.includes(colId as string)) {
      return false;
    }
  }

  // Validate columns object has all columns with proper structure
  for (const colId of validColumnIds) {
    const column = (state.columns as Record<string, unknown>)[colId];
    if (!column || typeof column !== "object") {
      return false;
    }
    const col = column as Record<string, unknown>;
    if (typeof col.id !== "string" || typeof col.name !== "string" || !Array.isArray(col.cardIds)) {
      return false;
    }
  }

  // Validate all cards referenced in columns exist
  const cards = state.cards as Record<string, unknown>;
  for (const colId of validColumnIds) {
    const column = (state.columns as Record<string, unknown>)[colId] as Record<string, unknown>;
    const cardIds = column.cardIds as string[];
    for (const cardId of cardIds) {
      const card = cards[cardId];
      if (!card || typeof card !== "object") {
        return false;
      }
      const c = card as Record<string, unknown>;
      if (typeof c.id !== "string" || typeof c.title !== "string" || typeof c.details !== "string") {
        return false;
      }
    }
  }

  return true;
}

/**
 * Loads board state from localStorage
 * @returns The stored board state, or null if not found/invalid
 */
export function loadBoardState(): BoardState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return null;
    }

    const parsed: unknown = JSON.parse(serialized);

    // Handle versioned storage format
    if (typeof parsed === "object" && parsed !== null && "version" in parsed && "state" in parsed) {
      const stored = parsed as StoredBoardState;
      if (stored.version === CURRENT_VERSION && isValidBoardState(stored.state)) {
        return stored.state;
      }
    }

    // Try legacy format (direct BoardState)
    if (isValidBoardState(parsed)) {
      return parsed as BoardState;
    }

    // Invalid data structure, clear it
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (error) {
    // Invalid JSON or other parsing error, clear the corrupt data
    console.error("Failed to load board state from localStorage:", error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors when clearing
    }
    return null;
  }
}

/**
 * Saves board state to localStorage
 * @param state - The board state to save
 * @returns true if save was successful, false otherwise
 */
export function saveBoardState(state: BoardState): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored: StoredBoardState = {
      version: CURRENT_VERSION,
      state,
    };
    const serialized = JSON.stringify(stored);
    localStorage.setItem(STORAGE_KEY, serialized);
    return true;
  } catch (error) {
    // Silently fail on storage errors
    console.error("Failed to save board state to localStorage:", error);
    return false;
  }
}

/**
 * Clears board state from localStorage
 * @returns true if clear was successful, false otherwise
 */
export function clearBoardState(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Failed to clear board state from localStorage:", error);
    return false;
  }
}

/**
 * Initializes board state from localStorage or returns seed data
 * @returns The initial board state
 */
export function initializeBoardState(): BoardState {
  const stored = loadBoardState();
  return stored ?? seedBoard;
}

/**
 * Resets board state to seed data and clears localStorage
 * @returns The reset seed board state
 */
export function resetBoardState(): BoardState {
  clearBoardState();
  return seedBoard;
}
