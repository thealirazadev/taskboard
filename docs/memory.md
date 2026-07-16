# Project Memory: taskboard

A running log of what is done, what is in progress, and why key decisions were made. Keep entries short and dated. Update this file as work proceeds.

## Completed

- 2026-07-15: Planning documentation created (README, PRD, architecture, rules, design, phases, testing, launch checklist).

- 2026-07-16: Phase 3 (cards and columns editing) complete. Card add/edit/delete, inline column rename, and add/delete columns all implemented with confirmation dialogs and inline title validation. Added a regression test asserting a `<script>` card title renders as literal text (no `dangerouslySetInnerHTML` is used anywhere, so React's default JSX escaping was already sufficient; the commit locks this in with a test rather than new sanitization code).

- 2026-07-17: Phase 4 (drag-and-drop with dnd-kit) complete. `feat(dnd): add dnd-kit context and sensors` had already landed; continued with `feat(dnd): make cards sortable within columns` (drag handle button on each `Card`, `SortableContext` per column, `moveWithinArray` reducer support for `MOVE_CARD`), `feat(dnd): support moving cards across columns` (`moveBetweenArrays`, cross-column `MOVE_CARD` branch), `fix(dnd): make empty columns a valid drop target` (an empty column has no sortable item to anchor a drop zone, so its placeholder now registers its own `useDroppable`), and `feat(dnd): add keyboard drag announcements` (dnd-kit `accessibility.announcements` for pick up/over/drop/cancel, plus a `DragOverlay` and drop-target highlight per `design.md`). `npm run test:run`, `npm run build`, and `npm run lint` all pass clean after every commit.
  - Limitation: this environment has no browser/display, so the phase's manual QA checklist (pointer drag, keyboard drag end to end, Esc-cancel, mid-drag refresh, reduced-motion) per `testing.md` (which calls DnD manual QA "authoritative") was reasoned through via reducer/unit tests and code review, not exercised in a live browser. Flagging this so a real manual pass happens before shipping.

- 2026-07-17: Phase 5 (multiple boards, theme, import/export) complete. `feat(board): add board switcher and creation` adds `ADD_BOARD`/`SWITCH_BOARD` reducer actions, a `BoardSwitcher` (board `<select>` plus an inline "New board" form using the same validated-title pattern as columns), wired into `AppShell`; new boards start with no columns, so the existing "no columns" empty state guides the user to add one. `feat(theme): add persisted light dark theme toggle` adds `useTheme`/`ThemeToggle`: the theme follows the OS preference through the CSS media query already in `index.css` until the user makes an explicit choice, which is persisted under `taskboard:theme` and applied as a `light`/`dark` class on `<html>` that overrides the media query. `feat(data): add board data export` adds a `DataTransfer` component that serializes the full `PersistedState` to a downloaded JSON file via `Blob`/`URL.createObjectURL`, guarded so an unsupported browser shows a friendly error instead of throwing. `feat(data): add validated board data import` reads a selected file with `FileReader`, parses it, and re-validates it through the existing `storage/schema.ts` (the same validator used for `localStorage` loads) before showing a confirmation dialog and dispatching the already-existing `REPLACE_STATE` action; malformed JSON or a valid-JSON-wrong-shape file is rejected with a friendly message and never touches existing data. A follow-up `style: apply prettier formatting` commit fixed formatting drift in the new test/component files. `npm run test:run` (90 tests), `npm run build`, and `npm run lint` all pass clean after every commit.
  - Minor deviation from `design.md`: the first-run "No boards yet" empty state does not carry its own "Create a board" button; the `BoardSwitcher`'s "New board" control, always visible in the header, serves that purpose instead. This avoids splitting the create-board form's state across two components for a cosmetic difference. Not a deviation from `PRD.md` or `architecture.md`, so no separate flag was raised beyond this note.
  - Limitation carried over from phase 4: no browser/display is available in this environment, so manual QA (real reload, keyboard operability walkthrough, storage-full/unavailable banners, focus return) was reasoned through via code review and the automated test suite rather than exercised live. A real manual pass against the `phases.md` verification checklist is still recommended before shipping.

## In progress

- None. All five phases in `phases.md` are implemented; the next work would be new phases or backlog items, none of which currently exist.

## Decisions log

- 2026-07-15: Persistence backend is `localStorage` under the versioned key `taskboard:v1`, not IndexedDB. Rationale: the data is a single small JSON document read once and written on change; localStorage's synchronous API keeps the storage layer minimal. Fallback if data outgrows this: migrate to IndexedDB via `idb` (requires approval and a schema migration).
- 2026-07-15: Order is stored as explicit id arrays (`boardOrder`, `columnOrder`, `cardIds`) rather than index fields, so drag moves are pure array operations with one source of truth.
- 2026-07-15: State management is a single reducer plus React context; no external state library. Rationale: scope is small and one reducer covers all mutations.
- 2026-07-15: Ids use `crypto.randomUUID()` and timestamps use `Date.now()`; no id or date dependency added.
- 2026-07-15: Drag-and-drop uses dnd-kit specifically for its accessible keyboard sensor and live-region announcements, which the full-keyboard-drag requirement needs.
- 2026-07-15: No `.env` and no environment variables; the app has no secrets or per-environment config.
