# taskboard

taskboard is a local-first Kanban board web app that runs entirely in the browser. Create boards with editable columns (default To Do / In Progress / Done), add cards with a title and description, drag cards between and within columns, and reorder or navigate everything with the keyboard. All data persists locally under a versioned key, so there is no account, no server, and no network dependency.

## Features

- Multiple boards, each with its own columns and cards
- Editable columns; defaults are To Do, In Progress, Done
- Add, edit, and delete cards with a title and an optional description
- Drag cards between columns and reorder within a column
- Full keyboard operation, including keyboard-driven drag-and-drop
- Light and dark theme that follows the system preference and can be toggled
- Local-first persistence in the browser; data survives refresh and restart
- Import and export board data as JSON
- Friendly empty states for boards, columns, and cards
- Responsive layout for desktop and mobile

## Tech stack

- React 18 with TypeScript
- Vite build tooling
- Tailwind CSS for styling
- dnd-kit for accessible drag-and-drop (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- localStorage for persistence under a versioned key
- Vitest and React Testing Library for tests
- ESLint and Prettier for linting and formatting

## Prerequisites

- Node.js 20 LTS or newer
- npm 10 or newer

## Install

```bash
npm install
```

Exact dependency versions are pinned in `package.json` and locked in `package-lock.json`. Commit the lockfile.

## Run

Development server with hot reload:

```bash
npm run dev
```

Production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Test

Run the unit and component test suite:

```bash
npm run test
```

Run tests once in CI mode:

```bash
npm run test:run
```

Type-check and lint:

```bash
npm run typecheck
npm run lint
```

The build and the test suite must both pass before any feature is considered done. See `docs/testing.md` for details.

## Project structure

```
taskboard/
  docs/            Planning and handoff documentation
  public/          Static assets
  src/
    components/    Presentational and container React components
    hooks/         Reusable hooks (state, persistence, theme)
    state/         Board state reducer and context
    storage/       localStorage read/write and schema versioning
    lib/           Small pure helpers (ids, validation, sanitize)
    types/         Shared TypeScript types (Board, Column, Card)
    App.tsx        Application shell
    main.tsx       Entry point
  index.html
  package.json
```

See `docs/architecture.md` for the full breakdown.

## License

License: MIT
