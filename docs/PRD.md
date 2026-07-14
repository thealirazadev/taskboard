# Product Requirements Document: taskboard

## What we're building

taskboard is a local-first Kanban board web application. It lets a single person organize work into boards, columns, and cards without signing in or connecting to any server. Everything the user creates is stored in their own browser under a versioned key and is available offline. The product prioritizes a fast, keyboard-accessible board experience over collaboration or sync.

## Target user

An individual who wants a lightweight personal Kanban tool that works offline and keeps data private on their own device. Examples: a developer tracking personal tasks, a student organizing coursework, a freelancer planning a small project. This user values speed, keyboard control, and not having to create an account. This user does not need real-time collaboration, comments, or multi-device sync.

## Core features (prioritized)

### 1. Persistent boards, columns, and cards (highest priority)
The user can create a board that contains ordered columns, and each column contains ordered cards. A card has a title and an optional description. All of this persists locally and reloads automatically.

### 2. Card creation and editing
The user can add a card to a column, edit its title and description, and delete it. Title is required; description is optional.

### 3. Drag-and-drop between and within columns
The user can move a card to a different position within its column or into a different column by dragging with a pointer. Order is preserved after the move and after reload.

### 4. Full keyboard operation, including drag
Every action, including moving a card, can be performed with the keyboard alone. Focus is always visible and drag operations announce their state to assistive technology.

### 5. Editable columns
The user can rename columns, add columns, and remove columns. New boards start with To Do, In Progress, and Done.

### 6. Multiple boards
The user can create more than one board and switch between them. One board is active at a time.

### 7. Theme (light/dark)
The interface respects the system color scheme and offers a manual toggle. The choice persists.

### 8. Import and export (lowest priority of the core set)
The user can export all board data to a JSON file and import a previously exported file, replacing current data after confirmation. Imported data is validated before use.

## Non-goals

- No backend, server, or database
- No user accounts, authentication, or authorization
- No real-time collaboration or multi-user editing
- No cross-device sync or cloud storage
- No comments, attachments, labels, due dates, or checklists in the initial product
- No native mobile app; a responsive web layout is sufficient
- No analytics, telemetry, or third-party tracking
- No internationalization beyond English in the initial product

## Success criteria per core feature

### 1. Persistent boards, columns, and cards
- Creating a board, adding columns and cards, then refreshing the page restores the exact same state.
- Data written by an older schema version is migrated or safely reset with a visible message rather than crashing.
- With no saved data, the app shows a first-run empty state and offers to create a board.

### 2. Card creation and editing
- Submitting a card with a non-empty title adds it to the target column at the expected position.
- Submitting a card with an empty or whitespace-only title is blocked with an inline validation message and no card is created.
- Editing a card updates it in place and persists after reload.
- Deleting a card removes it and cannot be undone by accident; a confirm step guards deletion.

### 3. Drag-and-drop between and within columns
- Dropping a card in a new position updates its order and persists after reload.
- Dropping a card back in its original position leaves state unchanged and produces no error.
- The empty area of a column is a valid drop target so a card can be moved into an empty column.

### 4. Full keyboard operation, including drag
- The user can tab to a card, pick it up, move it up, down, or across columns, and drop it, using only the keyboard.
- Focus is visible on every interactive element and returns to a sensible element after each action.
- Screen reader users receive announcements when a drag starts, moves, and ends.

### 5. Editable columns
- Renaming a column persists and updates the heading immediately.
- A new board is created with exactly To Do, In Progress, and Done in that order.
- Deleting a column that contains cards asks for confirmation and removes the column and its cards.

### 6. Multiple boards
- Creating a second board does not affect the first board's data.
- Switching boards shows the correct columns and cards for the selected board.
- The active board is remembered after reload.

### 7. Theme
- On first load the theme matches the operating system preference.
- Toggling the theme updates the interface immediately and persists across reloads.

### 8. Import and export
- Export downloads a JSON file containing all boards, columns, and cards.
- Importing a valid exported file restores that data after a confirmation step.
- Importing malformed or invalid JSON is rejected with a friendly message and leaves existing data untouched.
