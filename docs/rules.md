# Engineering Rules: taskboard

These rules are binding for anyone implementing taskboard. When a rule and a task conflict, stop and flag it rather than guessing.

## Conventions

### Preferred libraries and patterns
- Use the stack in `architecture.md`: React function components with hooks, TypeScript in strict mode, Tailwind for styling, dnd-kit for drag-and-drop, localStorage for persistence.
- State lives in one reducer (`boardReducer`) exposed through `BoardContext`. Components dispatch actions; they never mutate state directly.
- Keep the reducer pure. Side effects (persistence, logging) live in hooks and effects, not in the reducer.
- Derive data with selectors in `state/selectors.ts` rather than storing computed values.
- Prefer small pure helpers in `lib/` (reorder, validation, id, sanitize) over inlining logic in components.

### What to avoid
- No Redux, MobX, Zustand, or other state libraries. The reducer plus context is sufficient.
- No data-fetching or server-state libraries (React Query, SWR). There is no server.
- No CSS-in-JS runtime libraries. Use Tailwind utilities and `tailwind.config.ts` tokens.
- No id or date libraries; use `crypto.randomUUID()` and `Date.now()`.
- No `any`. Use precise types; use `unknown` plus narrowing at trust boundaries (parsing, import).
- No inline styles for anything the design tokens already cover.
- No default exports for components or hooks; use named exports for grep-ability.

### Naming
- Components: PascalCase, one component per file, file named after the component (`Card.tsx` exports `Card`).
- Hooks: `useX` camelCase, one hook per file (`useTheme.ts` exports `useTheme`).
- Non-component modules: camelCase file names (`boardReducer.ts`, `persistence.ts`).
- Types and interfaces: PascalCase (`Board`, `Column`, `Card`, `PersistedState`).
- Variables and functions: camelCase; booleans read as predicates (`isDragging`, `hasCards`).
- Action types: `SCREAMING_SNAKE_CASE` string literals (for example `MOVE_CARD`, `ADD_CARD`).
- Storage keys: lowercase, colon-namespaced, versioned (`taskboard:v1`, `taskboard:theme`).
- Test files: co-located `*.test.ts` / `*.test.tsx` next to the unit under test.

### Commit format
- Conventional Commits: `type(scope): short imperative subject`.
- Allowed types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `build`.
- Subject is imperative and lower-case, no trailing period, aim for 50 characters or fewer.
- Example: `feat(card): add inline card editor`.

### One commit per feature
- Exactly one commit per feature or task, following the ordered commit list in `phases.md`.
- Never batch multiple features into one commit. Never split one feature across unrelated commits.
- Do not mix refactors with feature work in the same commit.

### Dependencies and lockfile
- Pin exact versions in `package.json` (no `^` or `~`).
- Commit `package-lock.json` with every dependency change.
- Suggested pinned versions (adjust only with approval, and record the change):
  - `react` 18.3.1, `react-dom` 18.3.1
  - `@dnd-kit/core` 6.1.0, `@dnd-kit/sortable` 8.0.0, `@dnd-kit/utilities` 3.2.2
  - `typescript` 5.6.3, `vite` 5.4.10, `@vitejs/plugin-react` 4.3.3
  - `tailwindcss` 3.4.14, `postcss` 8.4.47, `autoprefixer` 10.4.20
  - `vitest` 2.1.4, `@testing-library/react` 16.0.1, `@testing-library/user-event` 14.5.2, `@testing-library/jest-dom` 6.6.2, `jsdom` 25.0.1
  - `eslint` 8.57.1, `prettier` 3.3.3, `@types/react` 18.3.12, `@types/react-dom` 18.3.1
- Adding any new dependency requires approval (see Boundaries).

## Error handling and logging

- **One consistent approach.** All fallible boundaries (storage read/write, JSON parse, import) return a discriminated result or throw a typed error that a single surface (`ErrorBanner`) renders. Do not scatter ad hoc `try/catch` with silent failures.
- **Guard all storage access.** Every `localStorage` call goes through `storage/localStorageDriver.ts`, which wraps `getItem`, `setItem`, and `removeItem` in try/catch. Never call `window.localStorage` directly from components or the reducer. Treat `localStorage` as possibly unavailable (private mode, disabled) and degrade to in-memory state with a visible notice.
- **Quota errors.** Catch `QuotaExceededError` on write; keep the in-memory state, do not lose the user's current edit, and show a friendly banner such as "Storage is full, recent changes may not be saved."
- **Parse and validation errors.** On load, a parse failure or schema-validation failure must not crash. Show a friendly message and offer to start fresh; never wipe data silently.
- **Import errors.** Validate imported JSON against `storage/schema.ts` before applying. Reject invalid input with a clear message and leave existing data untouched.
- **Friendly UI messaging.** User-facing messages are plain, specific, and non-technical. No stack traces or error codes in the UI.
- **Logging.** Use `lib/logger.ts` for dev-only structured logging (`logger.warn`, `logger.error` with a context object). Logging is a no-op in production builds. No `console.log` left in shipped code; lint should flag stray `console` usage.

## Security

- **No secrets.** The app has no API keys, tokens, or credentials. Nothing sensitive is ever committed or stored.
- **Escape user text rendered as HTML.** Card titles, descriptions, column names, and board names are user input. Render them as text through React (which escapes by default). Never use `dangerouslySetInnerHTML` with user content. If any user text must be inserted as HTML, route it through `lib/sanitize.ts` first.
- **Validate imported data.** All imported JSON passes through `storage/schema.ts` runtime validation (correct shape, expected version, string fields are strings, arrays reference existing ids) before it replaces state. Drop or reject anything that does not validate.
- **No untrusted execution.** Never `eval` or construct functions from stored or imported data.
- **No third-party network calls, analytics, or trackers.**

## Simplicity (YAGNI / KISS)

- Build only what the current phase in `phases.md` requires. Do not add features, abstractions, or configuration on speculation.
- Prefer the smallest solution that satisfies the acceptance criteria. A plain function beats a class; a local component beats a shared abstraction until a second caller exists.
- Do not add generic "manager" or "service" layers, plugin systems, or config flags that no current feature uses.
- Choose one persistence backend (localStorage) and do not build an abstraction for swapping it until a phase requires it.

## Code style

- Comments are sparse and explain why, not what. No commented-out code.
- Docstrings are concise: one line on exported functions/hooks whose purpose is not obvious from the name.
- No emoji anywhere in code, comments, commits, or docs.
- No AI, assistant, or authorship attribution anywhere. No "generated by" or "co-authored by" notes.
- Formatting is owned by Prettier; linting by ESLint. Do not hand-format against the configured rules.
- TypeScript strict mode on; no `@ts-ignore` without a one-line justification comment.

## Boundaries

- **No wholesale delete or rewrite.** Do not delete or rewrite large sections of working code to achieve a small change. Make the smallest correct edit.
- **Do not change PRD or architecture silently.** If a task requires deviating from `PRD.md` or `architecture.md`, stop and flag the conflict with a short note and a proposed change before proceeding.
- **No new dependency without approval.** Adding any package (runtime or dev) requires explicit approval. Propose it with a one-line justification and the exact version first.
- **Ask when ambiguous.** If a requirement is unclear or under-specified, ask rather than guessing.
- **Stop after two failed fix attempts.** If two attempts to fix the same failure do not work, stop, summarize what was tried and the current state, and ask for direction instead of continuing to churn.
- **Scope every change.** Classify work as belonging to the current phase, a new phase, or the backlog. Only implement current-phase work; record the rest in `phases.md` under Backlog and note it in `memory.md`.
