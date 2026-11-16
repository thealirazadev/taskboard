# Changelog

## Unreleased

### Added
- Cards can be filtered by title or description.
- Imported board data is validated before it is used.
- Board data can be exported as JSON.
- The light and dark theme can be toggled, and the choice is saved.
- Boards can be switched and created.
- Keyboard drag-and-drop announces moves.
- Empty columns can receive dropped cards.
- Cards can be moved across columns.
- Cards can be reordered within a column.
- Drag-and-drop is built on dnd-kit, with its context and sensors.
- User-entered text is escaped when rendered.
- Columns can be added and deleted.
- Columns can be renamed inline.
- Cards can be deleted after a confirmation.
- Cards are edited in an editor for the title and description.
- New cards are created with a form that validates the title.
- Board state is loaded and saved in the browser.
- Board actions and context manage the state.
- Stored data has schema validation and migrations.
- Board state is saved under a versioned key.
- Storage uses a guarded localStorage driver.
- The default columns are rendered on a static board.
- Board, column and card types are defined.

### Fixed
- New boards start with To Do, In Progress and Done columns.
- Vite, Vitest and the React plugin were upgraded, and patched transitive packages are pinned.
