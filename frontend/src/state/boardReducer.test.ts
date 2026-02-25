import { seedBoard } from "@/data/seedBoard";
import { boardReducer } from "@/state/boardReducer";

function cloneSeed() {
  return structuredClone(seedBoard);
}

describe("boardReducer", () => {
  it("renames a column", () => {
    const next = boardReducer(cloneSeed(), {
      type: "renameColumn",
      payload: { columnId: "col-1", name: "Ideas" },
    });
    expect(next.columns["col-1"].name).toBe("Ideas");
  });

  it("adds a card with trimmed title", () => {
    const next = boardReducer(cloneSeed(), {
      type: "addCard",
      payload: { columnId: "col-2", title: "  New Ticket  ", details: "  Details  " },
    });
    const newCardId = next.columns["col-2"].cardIds.at(-1);
    expect(newCardId).toBeDefined();
    expect(next.cards[newCardId!].title).toBe("New Ticket");
    expect(next.cards[newCardId!].details).toBe("Details");
  });

  it("rejects empty title when adding card", () => {
    const base = cloneSeed();
    const next = boardReducer(base, {
      type: "addCard",
      payload: { columnId: "col-2", title: "   ", details: "Ignored" },
    });
    expect(next).toEqual(base);
  });

  it("deletes a card", () => {
    const next = boardReducer(cloneSeed(), {
      type: "deleteCard",
      payload: { columnId: "col-1", cardId: "task-1" },
    });
    expect(next.cards["task-1"]).toBeUndefined();
    expect(next.columns["col-1"].cardIds).not.toContain("task-1");
  });

  it("moves a card within the same column", () => {
    const next = boardReducer(cloneSeed(), {
      type: "moveCard",
      payload: {
        fromColumnId: "col-3",
        toColumnId: "col-3",
        fromIndex: 0,
        toIndex: 1,
      },
    });
    expect(next.columns["col-3"].cardIds).toEqual(["task-5", "task-4"]);
  });

  it("moves a card across columns", () => {
    const next = boardReducer(cloneSeed(), {
      type: "moveCard",
      payload: {
        fromColumnId: "col-1",
        toColumnId: "col-2",
        fromIndex: 0,
        toIndex: 1,
      },
    });
    expect(next.columns["col-1"].cardIds).toEqual(["task-2"]);
    expect(next.columns["col-2"].cardIds).toEqual(["task-3", "task-1"]);
  });
});

