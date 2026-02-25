import type { BoardState } from "@/types/kanban";

export const seedBoard: BoardState = {
  columnOrder: ["col-1", "col-2", "col-3", "col-4", "col-5"],
  columns: {
    "col-1": {
      id: "col-1",
      name: "Backlog",
      cardIds: ["task-1", "task-2"],
    },
    "col-2": {
      id: "col-2",
      name: "Ready",
      cardIds: ["task-3"],
    },
    "col-3": {
      id: "col-3",
      name: "In Progress",
      cardIds: ["task-4", "task-5"],
    },
    "col-4": {
      id: "col-4",
      name: "Review",
      cardIds: ["task-6"],
    },
    "col-5": {
      id: "col-5",
      name: "Done",
      cardIds: ["task-7"],
    },
  },
  cards: {
    "task-1": {
      id: "task-1",
      title: "Define release scope",
      details: "List must-have stories for this sprint's MVP.",
    },
    "task-2": {
      id: "task-2",
      title: "Sketch onboarding",
      details: "Prepare first-pass wireframes for new members.",
    },
    "task-3": {
      id: "task-3",
      title: "Write acceptance checks",
      details: "Capture happy paths and edge-case rules.",
    },
    "task-4": {
      id: "task-4",
      title: "Implement board reducer",
      details: "Support rename, add, delete, and move card actions.",
    },
    "task-5": {
      id: "task-5",
      title: "Refine card visual style",
      details: "Align spacing and hierarchy with palette.",
    },
    "task-6": {
      id: "task-6",
      title: "Review interaction states",
      details: "Check focus ring and hover behavior.",
    },
    "task-7": {
      id: "task-7",
      title: "Publish sprint notes",
      details: "Summarize completed work for stakeholders.",
    },
  },
};

