# Testing: taskboard

## Strategy

taskboard uses two layers of testing:

1. **Automated tests (Vitest + React Testing Library).** These cover pure logic and user-visible component behavior. They run in jsdom and must pass before any feature is considered done.
   - **Unit tests** for pure modules: `boardReducer`, `reorder`, `validation`, `id`, `selectors`, `localStorageDriver`, `migrations`, `persistence` (serialize/deserialize/migrate), and `schema` (load and import validation). These are the highest-value, lowest-cost tests and cover happy paths and the unhappy paths listed under Manual QA.
   - **Component tests** for interactive behavior with React Testing Library: adding a card, blocking an empty title, editing and deleting a card, renaming a column, switching boards, and theme toggling. Assert on what the user sees and on accessible roles/labels, not implementation details.

2. **Manual QA.** Drag-and-drop and keyboard drag are verified manually against the checklist below. While dnd-kit interactions can be partially exercised in tests, the authoritative check for pointer and keyboard drag, focus movement, and screen-reader announcements is manual. Persistence across a real page reload and behavior with storage disabled are also verified manually.

### What to test where

- Order/move correctness, validation, migration, import validation: automated unit tests.
- Forms, empty states, and rendering of user text: automated component tests.
- Pointer drag, keyboard drag, focus return, live-region announcements, real reload, responsive layout, storage disabled/full: manual QA.

### Manual QA checklist

- Drag a card within a column, across columns, and into an empty column; reload and confirm the order.
- Drop a card back where it started: nothing changes and no console error appears.
- Keyboard only: focus a card's drag handle, pick it up, move it down and across, drop it, and cancel a drag with Esc.
- With a filter active, confirm dragging is paused and the match count is announced.
- Reload mid-edit: state reflects the last committed change.
- Corrupt the `taskboard:v1` value in devtools and reload: a friendly message offers to start fresh and nothing crashes.
- Block storage (private mode): the app runs in memory with a visible notice.
- Simulate a `QuotaExceededError`: the current edit stays on screen and a banner explains it.
- Import a malformed file and a valid-JSON-but-wrong-shape file: both are rejected and existing data is unchanged.
- Toggle the theme and reload; on a fresh profile the first load matches the OS preference.
- With `prefers-reduced-motion`, drag still works without the overlay tilt.
- Very long titles and descriptions wrap without breaking the layout, and focus returns sensibly after dialogs and drags.

### Coverage expectations
- Every pure module in `lib/`, `state/`, and `storage/` has unit tests including at least one unhappy path.
- No blanket coverage percentage is enforced; prioritize meaningful assertions over line count.

## Test file conventions

- Co-locate tests with the unit under test as `*.test.ts` / `*.test.tsx`.
- Shared setup (jest-dom matchers, cleanup) lives in `src/test/setup.ts`, referenced by the Vitest config.
- Use `@testing-library/user-event` for interactions; avoid firing raw events where a user-event exists.

## Exact commands

Install dependencies (first time):

```bash
npm install
```

Run tests in watch mode during development:

```bash
npm run test
```

Run tests once (CI / pre-commit gate):

```bash
npm run test:run
```

Type-check without emitting:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### package.json scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --max-warnings=0",
    "format": "prettier --write ."
  }
}
```

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every pull request targeting `main`.
On Ubuntu with Node.js 22 it installs dependencies with `npm ci` and then runs, in order:

1. `npm run lint` (ESLint with `--max-warnings=0`)
2. `npm run typecheck` (`tsc --noEmit`)
3. `npm run test:run` (Vitest, single run)
4. `npm run build` (type check plus `vite build`)

Any failing step fails the job. Before merging a change, run the same four commands locally and
work through the relevant items of the manual QA checklist above, with the browser console free of
errors and warnings.
