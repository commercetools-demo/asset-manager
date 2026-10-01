# Screenshot scripts

Regenerates the screenshots in `../../../docs/` (used by the top-level `README.md`)
against a real, logged-in Merchant Center session, headlessly, using Playwright.

## Prerequisites

- Real data: the product variant in `custom-view-config.mjs`'s
  `development.hostUriPath` needs at least one asset (for `asset-edit.png`), and so
  does the category if you capture `category-assets.png`. This script only navigates
  the UI — it never creates or modifies data.
- The dev server running in another terminal: `cd asset-manager && npm start`
  (defaults to `http://localhost:3001`).

## Usage

```shell
cd asset-manager/scripts/screenshots
npm install
npm run login      # opens a headed browser — log into the MC by hand, then it saves
                    # the session to auth-state.json + session-storage.json
                    # (gitignored, never commit them)
npm run capture     # headless; writes straight into ../../../docs, overwriting in place
```

Override the port with `MC_PORT` if needed.

## Notes

- **Always navigate to the root URL, never a deep link.** The dev server shows a
  "Custom View loader" simulator page at root; the embedded product/category context
  comes entirely from `custom-view-config.mjs`'s `development.hostUriPath`, not the
  browser URL. Once authenticated, a deep link 404s instead of showing the loader.
- **The panel renders inside its own `<iframe>`**, so every interaction goes through
  `page.frameLocator('iframe')`, and `shot()` screenshots the iframe element (which
  also crops out the loader page's chrome).
- **`storageState()` doesn't capture `sessionStorage`**, which the shell's silent-auth
  bootstrap depends on — without it the loader page hangs indefinitely.
  `login.mjs` snapshots it to `session-storage.json`; `capture.mjs` replays it via
  `context.addInitScript(...)`.
- **Use `{ force: true }` when clicking "Open the Custom View"** — a plain `.click()`
  times out waiting for the button to be "stable".
- **Only one locator (product or category) is reachable per dev-server run.**
  `npm run capture` captures the product screenshots by default; to capture
  `category-assets.png`, switch `hostUriPath` in `custom-view-config.mjs` to a
  category page (e.g. `/<project>/categories/<id>/general`), restart `npm start`, and
  run `MC_LOCATOR=category npm run capture`. Switch it back afterward. The saved
  login doesn't need to be redone.
