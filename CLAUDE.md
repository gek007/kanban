# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Single-board Kanban MVP built with Next.js 16, client-rendered only. Features 5 fixed columns (renamable), drag-and-drop card management, add/delete cards with title/details, and seeded dummy data. No persistence, no auth, no multi-board support.

## Development Commands

All commands must be run from the `frontend/` directory:

```bash
cd frontend
npm install           # Install dependencies
npm run dev           # Start dev server (uses webpack bundler)
npm run build         # Production build
npm run lint          # Run ESLint
npm run test          # Run Vitest unit tests
npm run test:watch    # Run unit tests in watch mode
npm run test:e2e      # Run Playwright E2E tests
npm run test:e2e:headed  # Run E2E tests with headed browser
```

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **State**: `useReducer` with pure reducer pattern (no external state library)
- **DnD**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **Testing**: Vitest + React Testing Library (unit), Playwright (E2E)
- **Font**: Plus Jakarta Sans (variable font)

### Directory Structure
```
frontend/src/
├── app/
│   ├── layout.tsx       # Root layout with font config
│   ├── page.tsx         # Main app entry, renders Board
│   └── globals.css      # All global styles and color variables
├── components/
│   ├── Board.tsx        # DndContext wrapper, drag handling
│   ├── Column.tsx       # Column with Droppable + SortableContext
│   ├── CardItem.tsx     # Individual card with Sortable
│   ├── EditableColumnTitle.tsx  # Inline column rename
│   └── AddCardForm.tsx  # Card creation form
├── state/
│   └── boardReducer.ts  # Pure reducer for all state mutations
├── types/
│   └── kanban.ts        # TypeScript interfaces and action types
└── data/
    └── seedBoard.ts     # Initial board state
```

### State Management Pattern

**Pure reducer approach**: All state mutations go through `boardReducer`. No side effects, no async operations. The reducer handles:
- `renameColumn`: Update column name (trims whitespace, rejects empty)
- `addCard`: Create new card with generated ID, append to column
- `deleteCard`: Remove card from state
- `moveCard`: Handle same-column reorders and cross-column moves

**Card ID generation**: Uses a counter sequence starting at 100, prefixed with `task-generated-`.

**Board state shape**:
```typescript
{
  columns: Record<ColumnId, Column>  // Normalized columns
  cards: Record<string, Card>        // Normalized cards
  columnOrder: ColumnId[]            // Fixed ordering of 5 columns
}
```

### Drag-and-Drop Architecture

- `Board.tsx`: Wraps everything in `DndContext`, handles `onDragEnd`
- `Column.tsx`: Uses `useDroppable` for column drop zones, `SortableContext` for cards
- `CardItem.tsx`: Uses `useSortable` for individual card dragging
- Collision detection: `closestCorners` strategy

**Key patterns**:
- Column drop zones have IDs prefixed with `column-drop-{columnId}`
- Card elements use their `cardId` as the draggable ID
- Drag handler resolves column from card ID before dispatching move action

## Color Scheme

Use these CSS variables (defined in `globals.css`):
- `--accent-yellow: #ecad0a` - Column top borders, highlights
- `--blue-primary: #209dd7` - Links, focus states, card left borders
- `--purple-secondary: #753991` - Submit buttons, important actions
- `--dark-navy: #032147` - Main headings, primary text
- `--gray-text: #888888` - Supporting text, labels
- `--surface-soft: #f3f8ff` - Column gradient background

## Component Patterns

- All interactive components use `'use client'` directive
- Callbacks flow up to `Board`, which dispatches reducer actions
- Forms use controlled inputs with local state
- Validation happens on submit, shows inline errors
- All components accept explicit props (no context providers for MVP)

## Testing Approach

### Unit Tests (Vitest)
- `boardReducer.test.ts`: Test all state transitions and edge cases
- `page.test.tsx`: Component-level tests with React Testing Library
- Use `data-testid` attributes for selectors

### E2E Tests (Playwright)
- Located in `frontend/tests/`
- Tests cover: initial load, column rename, add/delete cards, drag-and-drop
- Mobile viewport tests included (`iPhone 12` or similar)

## Constraints & Scope Guard

**No persistence**: State resets on refresh
**No backend**: All client-side only
**No multi-board**: Single board with 5 fixed columns
**No extra features**: No archive, search, filter, tags, due dates
**No auth**: No user management

## Key Implementation Details

- Column IDs are a fixed union: `'col-1' | 'col-2' | 'col-3' | 'col-4' | 'col-5'`
- Column names can be changed to any non-empty trimmed string
- Card title max length: 120 characters
- Card details max length: 500 characters
- Responsive: Horizontal scroll on mobile/tablet, full grid on desktop
