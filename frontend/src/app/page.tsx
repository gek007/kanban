"use client";

import { Board } from "@/components/Board";
import { KeyboardShortcutsHelp } from "@/components/KeyboardShortcutsHelp";

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Project Management MVP</p>
          <h1>Team Flow Board</h1>
        </div>
        <KeyboardShortcutsHelp />
      </header>
      <Board />
    </main>
  );
}
