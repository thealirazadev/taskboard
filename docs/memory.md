# Project Memory: taskboard

A running log of what is done, what is in progress, and why key decisions were made. Keep entries short and dated. Update this file as work proceeds.

## Completed

- 2026-07-15: Planning documentation created (README, PRD, architecture, rules, design, phases, testing, launch checklist).

## In progress

- Nothing yet. Implementation has not started. Phase 1 in `phases.md` is next.

## Decisions log

- 2026-07-15: Persistence backend is `localStorage` under the versioned key `taskboard:v1`, not IndexedDB. Rationale: the data is a single small JSON document read once and written on change; localStorage's synchronous API keeps the storage layer minimal. Fallback if data outgrows this: migrate to IndexedDB via `idb` (requires approval and a schema migration).
- 2026-07-15: Order is stored as explicit id arrays (`boardOrder`, `columnOrder`, `cardIds`) rather than index fields, so drag moves are pure array operations with one source of truth.
- 2026-07-15: State management is a single reducer plus React context; no external state library. Rationale: scope is small and one reducer covers all mutations.
- 2026-07-15: Ids use `crypto.randomUUID()` and timestamps use `Date.now()`; no id or date dependency added.
- 2026-07-15: Drag-and-drop uses dnd-kit specifically for its accessible keyboard sensor and live-region announcements, which the full-keyboard-drag requirement needs.
- 2026-07-15: No `.env` and no environment variables; the app has no secrets or per-environment config.
