# Security policy

## Supported versions

Only the latest release on `main` receives security fixes.

## Reporting a vulnerability

Please do not open a public issue. Use GitHub's private vulnerability reporting
(Security tab, "Report a vulnerability") or email thealirazadev@gmail.com with the
steps to reproduce. You should get a reply within 72 hours.

## How taskboard handles sensitive data

- All board data stays in the browser, in `localStorage` under a versioned key. The app has no server, and its source makes no network requests (README, `src/storage/localStorageDriver.ts`).
- Stored data is parsed as JSON and checked against a schema before it is used (`src/storage/persistence.ts`, `src/storage/schema.ts`).
- User-entered text is rendered through React. The source contains no `innerHTML` or `dangerouslySetInnerHTML` (`src/`).
