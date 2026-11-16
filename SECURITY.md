# Security policy

## Supported versions

Only the latest release (0.1.0, the version in `package.json`) on `main` receives security
fixes.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private vulnerability reporting
(Security tab, "Report a vulnerability") or email thealirazadev@gmail.com with the
steps to reproduce. You should get a reply within 72 hours.

## How taskboard protects your data

- Boards live only in the browser's `localStorage`, under a versioned key. There is no account,
  no server, and no network request in the application code.
- Imported JSON is parsed and checked against the persisted-state schema before it replaces any
  data, so a malformed file is rejected instead of loaded.
- Card and board text is rendered through React, and the code does not use `innerHTML` or
  `dangerouslySetInnerHTML`.
- Anyone with access to your browser profile can read the stored boards, so do not keep
  secrets or credentials on a board.
