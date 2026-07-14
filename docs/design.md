# Design System: taskboard

This is the full UI design system. It defines tokens (color, type, spacing, radius, shadow), component states, empty states, and the accessibility baseline. Tokens are implemented as Tailwind theme extensions in `tailwind.config.ts` and CSS variables in `src/index.css`. Use tokens, never raw hex values, in components.

## Principles

- Content first: the board, columns, and cards are the interface; chrome stays quiet.
- Calm neutral surfaces with a single accent for interactive emphasis.
- Every state (hover, focus, active, dragging, error, loading, empty, disabled) is designed, not incidental.
- Fully operable by keyboard, with visible focus and sufficient contrast in both themes.

## Color and theme

The app supports light and dark themes. Default follows `prefers-color-scheme`; a toggle overrides it and persists under `taskboard:theme`. Dark mode is enabled with Tailwind's `class` strategy: a `dark` class is set on `<html>`. Colors are defined as CSS variables so both themes share one set of semantic token names.

### Semantic tokens

| Token | Role | Light | Dark |
| --- | --- | --- | --- |
| `--color-bg` | App background | `#f8fafc` | `#0b1120` |
| `--color-surface` | Column background | `#ffffff` | `#111827` |
| `--color-surface-raised` | Card background | `#ffffff` | `#1f2937` |
| `--color-border` | Hairline borders | `#e2e8f0` | `#334155` |
| `--color-text` | Primary text | `#0f172a` | `#f1f5f9` |
| `--color-text-muted` | Secondary text | `#475569` | `#94a3b8` |
| `--color-accent` | Primary action, focus ring | `#2563eb` | `#3b82f6` |
| `--color-accent-hover` | Accent hover | `#1d4ed8` | `#60a5fa` |
| `--color-accent-contrast` | Text on accent | `#ffffff` | `#0b1120` |
| `--color-danger` | Destructive action, errors | `#dc2626` | `#f87171` |
| `--color-danger-contrast` | Text on danger | `#ffffff` | `#0b1120` |
| `--color-success` | Positive confirmation | `#16a34a` | `#4ade80` |
| `--color-drag-overlay` | Dragging card shadow tint | `rgba(37,99,235,0.15)` | `rgba(59,130,246,0.25)` |
| `--color-drop-target` | Highlighted drop column | `#eff6ff` | `#1e293b` |

### Contrast requirements
- Body text on its background: at least 4.5:1.
- Large text (>=18.66px bold or >=24px) and UI component boundaries: at least 3:1.
- Focus ring against adjacent colors: at least 3:1.
- The accent-on-white and text-on-accent pairs above meet 4.5:1; verify any new pairing before use.

## Typography

- Font family: system UI stack, no web font download.
  `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.
- Monospace (for ids in dev only): `ui-monospace, SFMono-Regular, Menlo, monospace`.
- Base size 16px, base line-height 1.5. Body copy uses `--color-text`; secondary uses `--color-text-muted`.

### Type scale

| Token | Size / line-height | Weight | Usage |
| --- | --- | --- | --- |
| `text-xs` | 12px / 16px | 500 | Metadata, helper text |
| `text-sm` | 14px / 20px | 400-500 | Card description, form labels |
| `text-base` | 16px / 24px | 400 | Default body, inputs |
| `text-lg` | 18px / 28px | 600 | Card title, column header |
| `text-xl` | 20px / 28px | 600 | Board title |
| `text-2xl` | 24px / 32px | 700 | App title, empty-state heading |

## Spacing scale

Base unit is 4px; the primary rhythm is 8px. Use only these steps.

| Token | Value |
| --- | --- |
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |

Conventions:
- Card padding: 12px (`space-3`).
- Gap between cards in a column: 8px (`space-2`).
- Column padding: 12px (`space-3`); gap between columns: 16px (`space-4`).
- Page padding: 16px mobile (`space-4`), 24px desktop (`space-6`).
- Form field vertical rhythm: 8px between label and input, 16px between fields.

## Border radius

| Token | Value | Usage |
| --- | --- | --- |
| `radius-sm` | 4px | Inputs, small buttons |
| `radius-md` | 8px | Cards, buttons |
| `radius-lg` | 12px | Columns, modals |
| `radius-full` | 9999px | Icon buttons, avatars |

## Shadows

Shadows are subtle in light mode and mostly replaced by borders in dark mode.

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `shadow-sm` | `0 1px 2px rgba(15,23,42,0.06)` | none, use border | Resting card |
| `shadow-md` | `0 2px 8px rgba(15,23,42,0.10)` | `0 2px 8px rgba(0,0,0,0.4)` | Hovered card, popovers |
| `shadow-lg` | `0 8px 24px rgba(15,23,42,0.18)` | `0 8px 24px rgba(0,0,0,0.5)` | Dragging card, modal |

## Component states

Every interactive component defines these states. Focus is always a visible ring: `2px` solid `--color-accent` with a `2px` offset, never removed without a replacement.

### Button
- Default: accent background, `--color-accent-contrast` text, `radius-md`, `shadow-sm`.
- Hover: background `--color-accent-hover`.
- Focus: accent focus ring, offset 2px.
- Active: slight scale-down (98%) or darker accent; no layout shift.
- Disabled: 50% opacity, `cursor: not-allowed`, no hover/active effects, `aria-disabled`.
- Loading: label replaced by an inline spinner and accessible text ("Saving..."), button disabled during the operation. Rarely needed given synchronous storage.
- Variants: `primary` (accent), `secondary` (surface + border), `danger` (`--color-danger`), `ghost` (transparent, text only).

### Text input and textarea
- Default: `--color-surface` background, `--color-border` 1px border, `radius-sm`, `text-base`.
- Hover: border darkens one step.
- Focus: accent ring, offset 2px; border becomes accent.
- Disabled: muted text, reduced opacity, not focusable.
- Error: `--color-danger` border, error message below via `aria-describedby`, `aria-invalid="true"`.
- Textarea grows to a max height then scrolls; supports multiline description.

### Card
- Default: `--color-surface-raised`, `shadow-sm` (light) or border (dark), `radius-md`, `space-3` padding.
- Hover: `shadow-md`, subtle lift, reveal edit/delete affordances.
- Focus: accent ring around the whole card; the card is a focusable, keyboard-draggable item.
- Active (grabbed): pressed state indicating it can be moved.
- Dragging: raised with `shadow-lg`, slight rotation or scale, semi-opaque placeholder left in the source position; a drag overlay follows the pointer/keyboard.
- Error: if a card fails to save, mark it with a `--color-danger` left border and a small inline notice.
- Loading: not applicable to individual cards (storage is synchronous); use skeleton only if a future async phase requires it.
- Empty: not applicable to a card; see column empty state.

### Column
- Default: `--color-surface`, `radius-lg`, `space-3` padding, header with editable title and card count.
- Hover: no strong change; header actions become visible.
- Focus: header controls have their own focus rings; the column itself is a labeled region.
- Drop target (drag over): `--color-drop-target` background and a `2px` dashed accent inner outline to show where the card will land.
- Empty: shows the column empty state (below) which is itself a valid drop target.
- Error: reserved for column-level failures; use `ErrorBanner` above the board instead where possible.

### Modal / dialog
- Overlay dims the page (`rgba(15,23,42,0.5)`), dialog uses `--color-surface`, `radius-lg`, `shadow-lg`.
- Focus is trapped inside; opening moves focus to the first field; closing returns focus to the trigger.
- Esc closes; a visible Cancel and a primary action are always present.
- Destructive confirmations use the `danger` button variant and name the object being deleted.

## Empty states

Empty states are designed, friendly, and offer the next action.

- **First run (no boards):** centered `EmptyState` with a `text-2xl` heading "No boards yet", one line of guidance, and a primary "Create a board" button.
- **Board with no columns:** message "This board has no columns" with an "Add column" button.
- **Column with no cards:** muted placeholder inside the column, for example "No cards. Add one below." The placeholder area is a valid drop target so a dragged card can be released into the empty column.
- **Import produced no data / reset after corruption:** message explaining data was reset and offering to create a board.

Empty-state copy is plain and specific; never a bare blank area.

## Accessibility baseline

- **Semantic markup.** The board is a labeled region; each column is a `section` with an accessible name from its title; the card list is a list (`ul`/`li`); headings follow a logical order (app title, board title, column titles). Buttons are `<button>`, not clickable `div`s.
- **Labels.** Every input has an associated `<label>`. Icon-only buttons have `aria-label` (for example "Delete card"). The card count is available to assistive tech, not color-only.
- **Full keyboard operation.** Everything is reachable and operable by keyboard: Tab/Shift+Tab to move between controls, Enter/Space to activate, Esc to cancel/close. Drag-and-drop uses dnd-kit's keyboard sensor: focus a card, press Space/Enter to pick it up, Arrow keys to move between positions and columns, Space/Enter to drop, Esc to cancel. Provide dnd-kit screen-reader `announcements` for pick up, move, over, drop, and cancel.
- **Visible focus.** A visible focus ring (accent, 2px, 2px offset) on every focusable element in both themes. Never `outline: none` without an equivalent visible indicator.
- **Color contrast.** Meets the contrast requirements listed in the Color section; state is never conveyed by color alone (pair color with text, icon, or border).
- **Motion.** Respect `prefers-reduced-motion`: disable non-essential transitions and drag animation flourishes; keep functional feedback.
- **Live regions.** Drag announcements and error banners use polite `aria-live` regions so updates are announced without stealing focus.
- **Targets.** Interactive targets are at least 40x40px on touch, with adequate spacing.
