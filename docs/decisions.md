# Design decisions

## 1. Order lives in id arrays, entities live in maps

Boards, columns, and cards are stored in `Record` maps keyed by id, and presentation order is
stored separately as id arrays (`boardOrder`, `columnOrder`, `cardIds`). A drag is then a pure
array operation (`moveWithinArray`, `moveBetweenArrays` in `src/lib/reorder.ts`) and there is
exactly one source of truth for order, instead of index fields on every card that would need
renumbering after each move. The cost is that the reducer has to keep maps and arrays in step:
deleting a column removes it from `columnOrder`, deletes the `Column`, and deletes every card
listed in its `cardIds`.

## 2. One pure reducer behind a context, no state library

All mutations go through `boardReducer` (`src/state/boardReducer.ts`), exposed through
`BoardContext`. Components dispatch actions and read through selectors. The app is small enough
that one reducer covers every change, and keeping it pure means persistence and logging live in
hooks, not in the state transitions. The reducer treats bad input as a no-op and returns the
same state object: an unknown board or column, an empty title after trimming, or a card dropped
back at its own index. Returning the identical object matters because the persistence effect
skips the write when the state reference has not changed.

## 3. A guarded storage driver that reports why it failed

Every `localStorage` call goes through `src/storage/localStorageDriver.ts`, which wraps
`getItem`, `setItem`, and `removeItem` and returns a `Result` with a `kind` of `unavailable`,
`quota`, or `failed`. Simply touching `window.localStorage` can throw in some private or
locked-down browsers, so even obtaining the storage object is inside the try. Quota errors are
detected by name (`QuotaExceededError`, and Firefox's `NS_ERROR_DOM_QUOTA_REACHED`) so the UI
can say "Storage is full" rather than a generic failure.

## 4. Corrupt data is never overwritten silently

Board data is a single JSON document under the versioned key `taskboard:v1`. Loading runs
parse, then migration, then schema validation (`src/storage/persistence.ts`). The outcome
decides one of three modes in `useBoardStorage`:

- `writable`: normal operation; each state change is written back.
- `memory-only`: storage is unavailable, so the app keeps working in the tab and shows a notice.
- `awaiting-reset`: the stored value exists but cannot be parsed, migrated, or validated. The app
  starts empty but does not write, so the original value stays in storage until the user picks
  "Start fresh". Writing the empty state straight away would have destroyed data that might still
  be recoverable by hand.

A failed write keeps the in-memory state, so a full disk loses no edit that is still on screen.

## 5. Strict schema validation, shared by load and import

`src/storage/schema.ts` checks more than shape: each entity's `id` must match its map key, id
arrays may not contain duplicates, the order arrays must list exactly the ids in their maps,
every card must be placed in exactly one column, titles must be non-empty after trimming, and
`createdAt` may not be later than `updatedAt`. An import goes through the same validator, then a
confirmation dialog, then a single `REPLACE_STATE`. Invalid JSON or a well-formed file with the
wrong shape is rejected with a plain message and existing data is left untouched. Imports must
already be at the current schema version; migrations only run on data read from storage.

## 6. dnd-kit for accessible drag, one action per drop

Drag-and-drop uses dnd-kit because it ships a keyboard sensor and live-region announcements, and
full keyboard operation of drag was a hard requirement. The pointer sensor needs 4px of movement
before a drag starts, so clicks on the buttons inside a card still register as clicks. The drop
handler computes the destination index and dispatches a single `MOVE_CARD`; the reducer clamps
the index and ignores a drop on the card's original position. Announcements cover pick up, over,
drop, drop outside any column, and cancel.

An empty column has no sortable item to anchor a drop, so at first a card could not be dragged
into an empty column. The empty-column placeholder now registers its own `useDroppable`, and a
drop on it appends to the end of the column.

## 7. Dragging pauses while a filter is active

The board can be filtered by card title or description, with a live match count. Drop indices
are computed from the cards that are rendered, so with some cards hidden a drop would land at
the wrong position in the full list. Rather than translate visible indices back to real ones,
sorting is disabled while the filter is non-empty and the status line says so.

## 8. New boards start with the default columns

A new board is created with To Do, In Progress, and Done, in that order. An earlier version
created boards with no columns, and the component test asserted that empty board, so the test
hid the defect. The fix creates the three columns in `BoardSwitcher`, and the test now asserts
the column headings in order.

## 9. Theme follows the system until the user chooses

With no stored preference the theme comes from the `prefers-color-scheme` media query in CSS, so
the first paint already matches the operating system with no script involved. Toggling stores
`light` or `dark` under a separate key, `taskboard:theme`, and applies it as a class on the root
element, which overrides the media query. Keeping it out of the board document means a corrupt
board payload never affects the theme, and the reverse.

## 10. User text is only ever rendered as text

Board, column, and card titles and descriptions are rendered through React's normal escaping,
and the code does not use `innerHTML` or `dangerouslySetInnerHTML`. Because escaping was already
correct, the safeguard is a regression test that creates a card titled with a `<script>` tag and
asserts that it shows as literal text and that no script element is created.

## 11. No id, date, or logging dependencies

Ids come from `crypto.randomUUID()` through `createId()`, which returns a `Result` so an old
browser without it produces a friendly error instead of a crash. Timestamps are `Date.now()`.
`src/lib/logger.ts` writes to the console only in development builds, so production code has no
stray console output, and ESLint allows `console` in that one file only.
