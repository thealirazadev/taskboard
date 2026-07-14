# Architecture: taskboard

## Overview

taskboard is a single-page React application with no backend. All state lives in the browser at runtime and is persisted to `localStorage` under one versioned key. The app is organized around a single reducer that owns the entire board tree, a thin storage layer that serializes that tree, and presentational components that render columns and cards. Drag-and-drop is handled by dnd-kit, which provides a keyboard sensor so every drag is operable without a pointer.

## App flow

1. `main.tsx` mounts `App` into `#root`.
2. On mount, the persistence hook (`useBoardStorage`) reads the versioned key from `localStorage`, validates and migrates the payload, and produces the initial state. If nothing is stored, it seeds a first-run empty state.
3. `App` provides the board state and dispatch through a React context (`BoardProvider`). The reducer is the single source of truth for boards, columns, and cards.
4. The board view renders the active board's columns; each column renders its cards. User actions (add card, edit card, rename column, move card) dispatch actions to the reducer.
5. After every state change, an effect in the persistence hook writes the serialized state back to `localStorage`, guarded against quota and serialization errors.
6. Theme is handled by `useTheme`, which reads the system preference, applies a class to the document root, and persists the manual choice under a separate key.
7. Drag-and-drop wraps the board in a dnd-kit `DndContext`. Pointer and keyboard sensors report drag start, move, over, and end events; the end handler dispatches a single move action to the reducer.

State is never fetched from or written to a network. There are no loading spinners for data other than the very brief synchronous read on first paint.

## Proposed folder and file tree

```
taskboard/
  index.html
  package.json
  package-lock.json
  tsconfig.json
  vite.config.ts
  vitest.config.ts             (may be merged into vite.config.ts)
  tailwind.config.ts
  postcss.config.js
  .eslintrc.cjs
  .prettierrc
  public/
    favicon.svg
  src/
    main.tsx                   Entry point; mounts App
    App.tsx                    Shell: header, board switcher, theme toggle, board view
    index.css                  Tailwind directives and base styles

    components/
      board/
        BoardView.tsx          Renders the active board and its DndContext
        BoardSwitcher.tsx      Select or create boards
        BoardHeader.tsx        Board title, add-column, import/export, theme toggle
      column/
        Column.tsx             One column: header, card list, add-card control
        ColumnHeader.tsx       Editable column title, delete column
        AddCardForm.tsx        Inline form to add a card
      card/
        Card.tsx               Sortable card (title, description preview)
        CardEditor.tsx         Modal or inline editor for title and description
      common/
        Button.tsx             Styled button with variants and states
        TextField.tsx          Labeled input with validation slot
        TextArea.tsx           Labeled multiline input
        Modal.tsx              Accessible dialog wrapper (focus trap, Esc to close)
        ConfirmDialog.tsx      Confirmation prompt for destructive actions
        EmptyState.tsx         Reusable empty-state block
        ErrorBanner.tsx        Non-blocking error message surface
        ThemeToggle.tsx        Light/dark switch

    hooks/
      useBoardStorage.ts       Load, persist, migrate the board tree
      useTheme.ts              System preference plus manual toggle
      useBoardState.ts         Access reducer state and dispatch from context
      useConfirm.ts            Promise-based confirmation helper

    state/
      boardReducer.ts          Pure reducer; all board/column/card mutations
      boardActions.ts          Action type definitions and creators
      BoardContext.tsx         Context and BoardProvider
      selectors.ts             Derived reads (active board, column by id, etc.)

    storage/
      localStorageDriver.ts    Guarded getItem/setItem/removeItem wrappers
      persistence.ts           Serialize, deserialize, key name, versioning
      migrations.ts            Version-to-version migration functions
      schema.ts                Runtime validation for loaded/imported data

    lib/
      id.ts                    createId() wrapper over crypto.randomUUID
      sanitize.ts              Escape user text rendered as HTML if needed
      reorder.ts               Pure array move/insert helpers for drag
      validation.ts            Title validation, import validation
      logger.ts                Dev-only structured logging

    types/
      board.ts                 Board, Column, Card, and PersistedState types

    test/
      setup.ts                 Testing Library and jest-dom setup
```

Folders may collapse if a project stays small (for example, `common/` components can live flat), but the separation between `components`, `hooks`, `state`, `storage`, `lib`, and `types` should be preserved.

## Tech stack with rationale

- **React 18 + TypeScript.** Component model fits a board of nested lists; TypeScript makes the Board/Column/Card shapes explicit and catches drag-and-drop index mistakes at compile time.
- **Vite.** Fast dev server and simple production build with first-class TypeScript and React support. Minimal configuration.
- **Tailwind CSS.** Utility classes keep the design system (spacing, radius, color tokens) consistent and co-located with markup, which suits a small single-developer project. Design tokens are centralized in `tailwind.config.ts`.
- **dnd-kit** (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`). Chosen over alternatives because it ships an accessible keyboard sensor and live-region announcements out of the box, which is required for the full-keyboard-drag success criterion. It is unopinionated about styling and integrates with a reducer cleanly through its `onDragEnd` event.
- **localStorage for persistence.** See the persistence section below for why this is chosen over IndexedDB.
- **Vitest + React Testing Library.** Vitest shares Vite's config and transform pipeline, so tests run with no separate build setup. React Testing Library encourages testing user-visible behavior, which matches the acceptance criteria.
- **ESLint + Prettier.** Enforce the naming and style conventions in `rules.md`.

## Data model

All types are declared in `src/types/board.ts`.

```ts
interface Card {
  id: string;          // crypto.randomUUID
  title: string;       // required, non-empty after trim
  description: string; // optional, may be empty string
  createdAt: number;   // epoch ms
  updatedAt: number;   // epoch ms
}

interface Column {
  id: string;
  title: string;       // e.g. "To Do"
  cardIds: string[];   // ordered; source of truth for card order
}

interface Board {
  id: string;
  title: string;
  columnOrder: string[];              // ordered column ids
  columns: Record<string, Column>;    // column id -> Column
  cards: Record<string, Card>;        // card id -> Card
  createdAt: number;
  updatedAt: number;
}

interface PersistedState {
  version: number;               // schema version, currently 1
  boards: Record<string, Board>; // board id -> Board
  boardOrder: string[];          // ordered board ids
  activeBoardId: string | null;  // currently selected board
}
```

Notes on the model:

- Order is stored explicitly as id arrays (`columnOrder`, `cardIds`, `boardOrder`) rather than as an index field on each entity. Moving a card is a pure array operation, which makes drag-and-drop and undo-safety simple and keeps a single source of truth for order.
- Entities are stored in `Record` maps keyed by id for O(1) lookup; the arrays define presentation order. The reducer must keep maps and order arrays consistent (for example, deleting a column removes it from `columnOrder`, deletes its `Column`, and deletes every card in its `cardIds`).
- `description` is always a string (empty when absent) so the UI and validation never branch on `undefined`.

## Persistence

- **Chosen store: localStorage.** Rationale: the entire board tree for a personal tool is small (kilobytes to low megabytes), the data is a single JSON document that is read once on load and written on change, and localStorage's synchronous, simple API keeps the storage layer tiny. IndexedDB would add asynchronous complexity and a dependency (`idb`) with no benefit at this data size. This decision is recorded in `docs/memory.md`; if a future phase needs larger data or partial writes, migrating to IndexedDB via `idb` is the documented fallback.
- **Key:** a single versioned key, `taskboard:v1`, holds the serialized `PersistedState`. The theme choice is stored separately under `taskboard:theme`.
- **Serialization:** `JSON.stringify(persistedState)` on write, `JSON.parse` on read, both wrapped in try/catch in `storage/persistence.ts`.
- **Versioning and migration:** the stored `version` field is compared against the current schema version. If lower, `storage/migrations.ts` runs ordered migration functions to bring it forward. If the payload is unparseable or fails schema validation, the app does not crash; it surfaces a friendly message and offers to start fresh (resetting the key) so a corrupt value cannot brick the app.
- **Write timing:** persistence happens in an effect after state changes. Writes are guarded so a `QuotaExceededError` or serialization failure is caught, logged in dev, and shown to the user as a non-blocking banner rather than throwing.

## Where state lives

State is client-only and lives in one place: the `boardReducer` state held by `BoardProvider` and exposed through `BoardContext`. Components read via `useBoardState` and selectors, and mutate only by dispatching actions. There is no server state, no cache layer, and no global mutable singletons. Theme is the only other piece of persisted client state and is owned by `useTheme`.

## External dependencies

Runtime:
- `react`, `react-dom`
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`

Build and dev:
- `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`
- `tailwindcss`, `postcss`, `autoprefixer`
- `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`
- `eslint`, `prettier`, and their configs

Ids use the built-in `crypto.randomUUID()`; no id library is added. Exact versions are pinned in `package.json` and locked in `package-lock.json` (see `rules.md`).

## Environment variables

None. The app has no secrets, no API endpoints, and no build-time configuration that varies by environment. There is intentionally no `.env` file. If configuration is ever needed, it must be added deliberately and documented here first.
