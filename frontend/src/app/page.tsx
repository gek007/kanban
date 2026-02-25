"use client";

import { Board } from "@/components/Board";

export default function HomePage() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Project Management MVP</p>
        <h1>Team Flow Board</h1>
      </header>
      <Board />
    </main>
  );
}
