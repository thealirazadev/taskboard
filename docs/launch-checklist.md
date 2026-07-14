# Launch Checklist: taskboard

Work through this before calling the project shippable. Every item must be checked. Items are unchecked by default.

## Build and quality gates

- [ ] Production build works (`npm run build` completes with no errors)
- [ ] `tsc --noEmit` passes with no type errors
- [ ] `npm run lint` passes with no errors and no warnings
- [ ] `npm run test:run` passes with no failing tests
- [ ] Preview of the production build runs (`npm run preview`) and behaves like dev
- [ ] `package.json` versions are pinned exactly and `package-lock.json` is committed

## Runtime health

- [ ] No console errors during normal use
- [ ] No console warnings during normal use
- [ ] No leftover `console.log` or debug output in shipped code
- [ ] App loads and is usable with an empty (first-run) state

## States and UX

- [ ] Loading and empty states exist everywhere they can occur (no boards, no columns, no cards, post-reset)
- [ ] Empty column area is a valid drop target
- [ ] Friendly error messaging for storage full, storage corrupt, and storage unavailable
- [ ] Import rejects malformed and wrong-shape JSON with a clear message and no data loss
- [ ] Destructive actions (delete card, delete column, import replace) require confirmation
- [ ] Long titles and descriptions wrap or truncate without breaking layout

## Responsive and mobile

- [ ] Responsive and mobile layout checked at narrow widths (columns scroll, no horizontal page overflow)
- [ ] Touch targets are at least 40x40px with adequate spacing
- [ ] Board is usable on a small screen (add, edit, move a card)

## Accessibility and keyboard

- [ ] Keyboard fully operable: every action reachable and operable without a pointer
- [ ] Keyboard drag-and-drop works end to end (pick up, move within and across columns, drop, cancel)
- [ ] Visible focus indicator on every interactive element in both themes
- [ ] Focus returns to a sensible element after dialogs and after drags
- [ ] Screen-reader announcements fire on drag pick up, move, over, drop, and cancel
- [ ] Semantic markup: labeled regions, list markup for cards, real buttons, logical heading order
- [ ] All inputs have associated labels; icon-only buttons have accessible names
- [ ] Color contrast meets the thresholds in `design.md`; state is never conveyed by color alone
- [ ] `prefers-reduced-motion` is respected

## Data and persistence

- [ ] Data persists across reload and browser restart under `taskboard:v1`
- [ ] Theme choice persists under `taskboard:theme` and first load matches OS preference
- [ ] Corrupt stored data is handled gracefully with an offer to reset, never a crash
- [ ] Export produces a valid JSON file; re-importing it restores the same data

## Security

- [ ] User text is rendered as escaped text; no `dangerouslySetInnerHTML` with user content
- [ ] Imported data is validated before it replaces state
- [ ] No secrets, keys, or tokens anywhere in the codebase
- [ ] No third-party network calls, analytics, or trackers

## Documentation

- [ ] README install/run/test steps are accurate against the final scripts
- [ ] `memory.md` reflects completed phases and any new decisions
- [ ] `phases.md` Backlog captures deferred work, if any
