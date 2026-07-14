# Delivery Phases: taskboard

Each phase is the smallest useful thing that ships and works. Implement phases in order. Do not start a phase until the previous phase's Definition of done and Phase verification pass. One commit per feature/task, in the order listed, using Conventional Commits.

---

## Phase 1: Project scaffold and a static board

Goal: a running app that renders a single hardcoded board with the three default columns and a few placeholder cards. No persistence, no drag, no editing yet.

### Definition of done
- App runs with `npm run dev` and builds with `npm run build`.
- Tailwind, ESLint, Prettier, and Vitest are configured; a trivial test passes.
- The design tokens from `design.md` exist in `tailwind.config.ts` and `src/index.css`.
- `types/board.ts` defines `Board`, `Column`, `Card`, `PersistedState`.
- The board view renders three columns (To Do, In Progress, Done) from in-memory state, each showing static cards.
- Layout is responsive: columns lay out horizontally on desktop and stack or scroll on mobile.

### Manual test checklist
- `npm run dev` serves the app with no console errors.
- Three columns render with correct titles and card counts.
- Light and dark tokens render correctly when the OS theme changes.
- Layout does not overflow the viewport horizontally on a narrow screen (columns scroll within their container).

### Commits
- `chore: scaffold vite react typescript project`
- `build: configure tailwind postcss and design tokens`
- `build: configure eslint prettier and vitest`
- `feat(types): add board column and card types`
- `feat(board): render static board with default columns`

---

## Phase 2: Persistence and board state

Goal: the board tree is owned by a reducer, exposed via context, and persisted to localStorage under `taskboard:v1`, surviving reload.

### Definition of done
- `boardReducer`, `boardActions`, `BoardContext`, and selectors exist.
- `storage/localStorageDriver.ts`, `persistence.ts`, `migrations.ts`, and `schema.ts` exist and are unit tested.
- On load, state is read from `taskboard:v1`; on change, it is written back through the guarded driver.
- First run (no stored data) seeds an empty state and shows the first-run empty state.
- Corrupt or unparseable stored data does not crash; the app shows a friendly message and can reset.
- The board view now reads from and writes to the reducer instead of local component state.

### Manual test checklist
- Create nothing, reload: first-run empty state appears.
- With seeded data, reload: exact same state returns.
- Manually corrupt the `taskboard:v1` value in devtools, reload: friendly message, offer to reset, no crash.
- Disable localStorage (private mode or block it): app still runs in memory with a visible notice.

### Commits
- `feat(storage): add guarded localStorage driver`
- `feat(storage): add persistence serialization and versioned key`
- `feat(storage): add schema validation and migrations`
- `feat(state): add board reducer actions and context`
- `feat(board): load and persist board state`

---

## Phase 3: Cards and columns editing

Goal: users can add, edit, and delete cards, and rename/add/delete columns. Title validation is enforced.

### Definition of done
- Add-card form adds a card to the target column; empty/whitespace title is blocked with an inline message.
- Card editor edits title and optional description; changes persist.
- Deleting a card requires confirmation.
- Column titles are editable inline; adding and deleting columns works; deleting a non-empty column confirms and removes its cards.
- User text is rendered as escaped text (no HTML injection).

### Manual test checklist
- Add a card with a valid title: it appears at the expected position and persists after reload.
- Submit an empty or whitespace-only title: blocked with a visible message, no card added.
- Edit a card, reload: edit persists.
- Delete a card: confirm step appears; after confirm the card is gone and stays gone after reload.
- Rename a column, add a column, delete a non-empty column (with confirm): all persist.
- Enter a title containing `<script>` or HTML: it renders as literal text, not markup.

### Commits
- `feat(card): add card creation form with title validation`
- `feat(card): add card editor for title and description`
- `feat(card): add card deletion with confirmation`
- `feat(column): add inline column rename`
- `feat(column): add and delete columns`
- `feat(security): escape user text rendering`

---

## Phase 4: Drag-and-drop with pointer and keyboard

Goal: cards can be reordered within a column and moved between columns with both pointer and keyboard, and the result persists.

### Definition of done
- The board is wrapped in a dnd-kit `DndContext` with pointer and keyboard sensors.
- Cards are sortable within a column and can be dropped into other columns, including empty ones.
- `onDragEnd` dispatches a single `MOVE_CARD` action; order persists after reload.
- Dropping a card in its original position is a no-op with no error.
- Keyboard drag works end to end (pick up, move across positions and columns, drop, cancel with Esc).
- dnd-kit `announcements` are provided for pick up, move, over, drop, and cancel.
- Dragging state matches the `design.md` dragging visuals (overlay, placeholder, drop-target highlight).

### Manual test checklist
- Drag a card to a new position in the same column: order updates and persists.
- Drag a card to a different column: it moves and persists.
- Drag a card into an empty column: it lands there.
- Drop a card back where it started: nothing changes, no console error.
- Keyboard only: focus a card, pick up, move down and across, drop; order updates and persists.
- Press Esc mid-drag: the card returns to its origin, state unchanged.
- Refresh the page mid-interaction (before dropping): state reflects the last committed order, no corruption.
- With `prefers-reduced-motion`, drag has no gratuitous animation but still works.

### Commits
- `feat(dnd): add dnd-kit context and sensors`
- `feat(dnd): make cards sortable within columns`
- `feat(dnd): support moving cards across columns`
- `feat(dnd): add keyboard drag announcements`

---

## Phase 5: Multiple boards, theme, import/export

Goal: complete the core feature set with a board switcher, a persisted theme toggle, and JSON import/export.

### Definition of done
- Users can create and switch boards; the active board persists across reload.
- Creating a board does not affect other boards' data.
- Theme follows the system preference on first load, can be toggled, and the choice persists under `taskboard:theme`.
- Export downloads all data as JSON; import validates and, after confirmation, replaces current data.
- Invalid import is rejected with a friendly message and leaves existing data untouched.

### Manual test checklist
- Create a second board, add cards, switch back and forth: each board keeps its own data.
- Reload: the previously active board is selected.
- Toggle theme, reload: theme choice persists; first-ever load matched OS theme.
- Export, then import the same file into a fresh state: data is restored after confirm.
- Import a malformed JSON file and a valid-JSON-but-wrong-shape file: both rejected, existing data intact.

### Commits
- `feat(board): add board switcher and creation`
- `feat(theme): add persisted light dark theme toggle`
- `feat(data): add board data export`
- `feat(data): add validated board data import`

---

## Phase verification (run at the end of every phase)

- Run the app (`npm run dev`) and exercise the phase's features end to end.
- Run tests (`npm run test:run`) and confirm they pass.
- Run `npm run build` and `npm run lint`; both must pass with no warnings.
- Check the browser console: no errors and no warnings during normal use.
- Unhappy paths:
  - Empty board (no columns / no cards): friendly empty states, no crash.
  - Empty or whitespace-only card title: blocked with an inline message.
  - Drag a card and drop it in the same spot: no change, no error.
  - Refresh mid-drag / mid-edit: state reflects the last committed change, no corruption.
  - Storage full (simulate `QuotaExceededError`): current edit is kept in memory, friendly banner shown.
  - Storage corrupt (manually break `taskboard:v1`): friendly message, offer to reset, no crash.
  - Storage unavailable (private mode): app runs in memory with a visible notice.
  - Empty states present for boards, columns, and cards.
  - Long inputs: very long card titles and descriptions wrap or truncate cleanly and do not break layout.
- Verify keyboard operability: every action reachable and operable by keyboard, focus visible, focus returns sensibly after dialogs and drags.

---

## Backlog

(Empty. Record out-of-scope ideas and deferred work here as they come up, with a one-line note and the phase they were deferred from.)
