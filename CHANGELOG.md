# Changelog

## Unreleased

### Added
- Card filtering by title or description, with dragging paused while a filter is on.
- Validated JSON import and JSON export of board data.
- Light and dark theme toggle that is remembered between visits.
- Board switcher and board creation.
- Keyboard drag-and-drop announcements.
- CI runs lint, typecheck, tests, and the build on every push and pull request.

### Fixed
- New boards start with the To Do, In Progress, and Done columns.
- Vite, Vitest, and the React plugin are upgraded, with patched transitive packages pinned, to
  resolve security advisories.

## 0.1.0

Local-first Kanban boards in the browser, with editable columns, drag-and-drop, full keyboard
operation, a theme toggle, and JSON import and export.
