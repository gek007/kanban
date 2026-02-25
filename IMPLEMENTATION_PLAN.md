# Implementation Plan: Single-Board Kanban MVP (Next.js in `frontend`)

## Summary
Build a client-rendered Next.js app in `frontend` with one Kanban board, fixed 5 columns (renamable), card title/details, drag-and-drop, add/delete card, seeded dummy data, no persistence, and polished UI using the specified color palette.  
Delivery includes rigorous unit tests and comprehensive Playwright integration tests, ending with a running dev server and all checks passing.

## Locked Decisions
- Package manager: `npm`
- DnD library: `@dnd-kit`
- Integration test depth: Comprehensive MVP coverage
- Rendering model: Client-side state only (`use client`, no backend storage)
- Scope guard: No archive, no filtering/search, no auth/user system, no multi-board

## Phase 1: Scaffolding and Tooling
### Work
- Create Next.js app in `frontend` with TypeScript, App Router, ESLint.
- Add root `.gitignore` (if missing) and verify `frontend/.gitignore` covers Node/Next artifacts.
- Add testing stack:
  - Unit/component: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom`
  - Integration: `playwright`
- Add npm scripts in `frontend/package.json`:
  - `dev`, `build`, `start`, `lint`, `test`, `test:watch`, `test:e2e`, `test:e2e:headed`
- Keep README minimal: setup + run + test commands only.

### Success Criteria
- `frontend` exists and runs with `npm run dev`.
- Lint and test scripts execute successfully.
- `.gitignore` correctly ignores dependencies/build/test artifacts.

## Phase 2: App Architecture and Data Model
### Work
- Define strict app types in `frontend/src/types/kanban.ts`:
  - `ColumnId` as fixed union of 5 IDs.
  - `Card` with `id`, `title`, `details`.
  - `Column` with `id`, `name`, `cardIds`.
  - `BoardState` with `columns`, `cards`, `columnOrder`.
- Seed dummy board data in `frontend/src/data/seedBoard.ts`.
- Implement pure reducer in `frontend/src/state/boardReducer.ts`:
  - `renameColumn`
  - `addCard`
  - `deleteCard`
  - `moveCard` (same-column reorder + cross-column move)
- Keep state local to page-level client component via `useReducer`.

### Success Criteria
- All board behavior is expressible through reducer actions.
- Data model enforces exactly 5 columns while allowing column name edits.
- Initial render uses seeded dummy data.

## Phase 3: UI/UX Implementation
### Work
- Build components:
  - `Board`
  - `Column`
  - `CardItem`
  - `AddCardForm`
  - `EditableColumnTitle`
- Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag/drop.
- Implement polished visual system in global CSS using required colors:
  - Accent Yellow `#ecad0a`
  - Blue Primary `#209dd7`
  - Purple Secondary `#753991`
  - Dark Navy `#032147`
  - Gray Text `#888888`
- Add responsive layout:
  - Desktop: 5-column board with smooth horizontal behavior
  - Mobile/tablet: horizontal scroll columns with touch-friendly cards/forms
- UX details:
  - Inline column rename (Enter saves, Escape cancels, blur saves)
  - Add-card form per column (`title` required, `details` optional)
  - Delete card button on each card
  - Subtle transitions/hover/focus states with accessible contrast and focus rings

### Success Criteria
- All required MVP interactions work in browser.
- UI is visually coherent, modern, and responsive across desktop/mobile.
- No extra features beyond requested scope.

## Phase 4: Rigorous Unit and Component Testing
### Work
- Reducer unit tests (`boardReducer.test.ts`):
  - rename column
  - add card with trimmed title
  - reject empty title
  - delete card
  - move within same column
  - move across columns
- Component tests with React Testing Library:
  - seeded board renders expected columns/cards
  - column rename interaction flows
  - add-card validation and submission
  - card deletion updates UI
- Keep tests deterministic (stable IDs, explicit test data).

### Success Criteria
- Unit tests cover all state transitions and edge cases.
- Component tests validate primary UI behaviors.
- `npm run test` passes reliably.

## Phase 5: Playwright Integration Testing (Comprehensive)
### Work
- Configure Playwright in `frontend`.
- Create E2E spec(s) for:
  - initial load with dummy data
  - rename each of the 5 column titles
  - add a card with title/details
  - delete an existing card
  - drag card to another column
  - reorder card within same column
  - mobile viewport smoke (`iPhone 12` or equivalent)
- Include robust selectors via `data-testid` where needed.

### Success Criteria
- `npm run test:e2e` passes end-to-end locally.
- Core workflows are validated in desktop and mobile contexts.
- Defects found during E2E are fixed before completion.

## Phase 6: Final Verification and Handoff
### Work
- Run final quality gate:
  - `npm run lint`
  - `npm run test`
  - `npm run test:e2e`
  - `npm run build`
- Launch `npm run dev` and confirm board is ready for use.
- Keep README concise and aligned with current commands.

### Success Criteria
- All checks pass.
- App is running in dev mode and usable.
- Implementation matches AGENTS.md constraints exactly.

## Public Interfaces and Types
- File: `src/types/kanban.ts`
- Exposed interfaces/types:
  - `type ColumnId = 'col-1' | 'col-2' | 'col-3' | 'col-4' | 'col-5'`
  - `interface Card { id: string; title: string; details: string }`
  - `interface Column { id: ColumnId; name: string; cardIds: string[] }`
  - `interface BoardState { columns: Record<ColumnId, Column>; cards: Record<string, Card>; columnOrder: ColumnId[] }`
  - `type BoardAction = ...` for rename/add/delete/move operations
- No backend/API contract introduced for MVP.

## Test Cases and Scenarios
1. Render: board loads with exactly 5 columns and seeded cards.
2. Rename: user renames a column; name updates immediately.
3. Add card: valid title adds card; empty/whitespace title is blocked.
4. Delete card: card is removed from UI and column order.
5. Move cross-column: dragged card appears in destination column.
6. Reorder same-column: dragged card changes position correctly.
7. Responsiveness: board remains usable on mobile viewport.
8. Non-persistence behavior: refresh resets to seed data.

## Assumptions and Defaults
- Use current stable versions of Next.js ecosystem at implementation time.
- Use local component/reducer state only; no storage/API.
- Card title max length default: 120 chars; details max length default: 500 chars.
- Column rename supports any non-empty trimmed string.
- Accessibility baseline includes semantic HTML, visible focus states, and keyboard-operable inputs/buttons.
