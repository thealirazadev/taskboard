# Testing: taskboard

## Strategy

taskboard uses two layers of testing:

1. **Automated tests (Vitest + React Testing Library).** These cover pure logic and user-visible component behavior. They run in jsdom and must pass before any feature is considered done.
   - **Unit tests** for pure modules: `boardReducer`, `reorder`, `validation`, `sanitize`, `persistence` (serialize/deserialize/migrate), and `schema` (import validation). These are the highest-value, lowest-cost tests and should cover happy paths and the unhappy paths listed below.
   - **Component tests** for interactive behavior with React Testing Library: adding a card, blocking an empty title, editing and deleting a card, renaming a column, switching boards, and theme toggling. Assert on what the user sees and on accessible roles/labels, not implementation details.

2. **Manual QA.** Drag-and-drop and keyboard drag are verified manually against the checklist in `phases.md` and the launch checklist. While dnd-kit interactions can be partially exercised in tests, the authoritative check for pointer and keyboard drag, focus movement, and screen-reader announcements is manual. Persistence across a real page reload and behavior with storage disabled are also verified manually.

### What to test where

- Order/move correctness, validation, migration, import validation: automated unit tests.
- Forms, empty states, and rendering of user text: automated component tests.
- Pointer drag, keyboard drag, focus return, live-region announcements, real reload, responsive layout, storage disabled/full: manual QA.

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

### Expected package.json scripts

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

## Definition of done gate

A feature is done only when all of the following pass locally:

1. `npm run test:run` passes with no failing tests.
2. `npm run build` completes successfully (which includes `tsc --noEmit`).
3. `npm run lint` reports no errors and no warnings.
4. The manual checklist for the relevant phase in `phases.md` passes, including the unhappy paths.
5. The browser console shows no errors or warnings when exercising the feature.

Do not commit a feature until the build and the test suite both pass.
