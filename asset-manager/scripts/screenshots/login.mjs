// Opens a headed browser against the local dev server so you can log into the
// Merchant Center by hand, then saves the resulting session (cookies + localStorage
// via storageState, plus sessionStorage separately — see below) for capture.mjs to
// reuse headlessly.
//
// Usage: npm start (in the asset-manager/ app root, in another terminal), then:
//   npm install && npm run login

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.MC_PORT || 3001;
// The root URL, not a product/category deep link. The dev server always shows
// an intermediate "Custom View loader" page at root; the actual embedded
// product/category context comes entirely from custom-view-config.mjs's
// development.hostUriPath. A deep link like /<project>/products/<id>/... only
// happens to also work here on a *fresh, unauthenticated* session (any URL
// redirects to login, then back to the same loader) — once already
// authenticated, that same deep link 404s ("We could not find what you are
// looking for") instead of showing the loader. Always use root.
const BASE = `http://localhost:${PORT}/`;
const AUTH_STATE_PATH = path.join(__dirname, 'auth-state.json');
const SESSION_STORAGE_PATH = path.join(__dirname, 'session-storage.json');

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 }).catch((e) => {
  console.log('goto error:', e.message);
});

// Confirm we actually left for the identity provider before waiting for the return trip,
// otherwise a transient localhost hit during the initial redirect matches immediately.
try {
  await page.waitForURL((url) => url.hostname !== 'localhost', { timeout: 15000 });
  console.log('Redirected to login at', page.url());
} catch {
  console.log('Did not redirect away from localhost — may already be logged in:', page.url());
}

console.log('Please log in now in the opened browser window. Waiting up to 10 minutes ...');

try {
  await page.waitForURL((url) => url.hostname === 'localhost', { timeout: 10 * 60 * 1000 });
} catch (e) {
  console.log('TIMEOUT waiting for login redirect:', e.message);
  await browser.close();
  process.exit(1);
}

// The custom view shell finishes loading (project selection, shell chrome, the
// embedded panel itself) a moment after the redirect.
await page.waitForLoadState('networkidle').catch(() => {});
await page.waitForTimeout(3000);
console.log('Back on localhost, current URL:', page.url());
console.log('Title:', await page.title());

// The dev server lands on an intermediate "Custom View loader" simulator page
// with an "Open the Custom View" link/button. Click through it now so the
// saved screenshot below (if you're eyeballing this run) shows the actual
// panel, not just the loader — capture.mjs repeats this same click itself
// on every run, so this step isn't strictly required for the saved session
// to work, only for sanity-checking that login succeeded.
try {
  const link = page.getByText(/open the custom view/i).first();
  await link.waitFor({ state: 'visible', timeout: 10000 });
  // `force: true` skips Playwright's actionability wait (visible, enabled,
  // AND "stable" — unchanged position across two animation frames). Plain
  // `.click()` timed out here waiting for "stable" even in a real headed
  // browser with a human watching nothing move — almost certainly a CSS
  // transition on the button that Playwright's heuristic is being overly
  // cautious about, not a real interaction problem.
  await link.click({ force: true });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(2000);
  console.log('Clicked through "Open the Custom View". URL now:', page.url());
} catch (e) {
  console.log(
    'Could not find/click "Open the Custom View" — continuing anyway:',
    e.message
  );
}

await page.context().storageState({ path: AUTH_STATE_PATH });
console.log('Saved storage state to', AUTH_STATE_PATH);

// `storageState()` only captures cookies + localStorage — NOT sessionStorage.
// This shell's silent-auth/OIDC bootstrap relies on sessionStorage; a fresh
// context missing it doesn't just get bounced to a login screen (the milder
// symptom documented for the sibling `visualizer` app) — it gets stuck in an
// infinite retry loop (repeated "Transition was skipped" errors) that hangs
// even a bare screenshot indefinitely, headless or headed. Snapshot it
// separately so capture.mjs can replay it via addInitScript before the app's
// own bootstrap code runs.
const sessionStorageEntries = await page.evaluate(() => ({ ...sessionStorage }));
fs.writeFileSync(
  SESSION_STORAGE_PATH,
  JSON.stringify(sessionStorageEntries, null, 2)
);
console.log('Saved sessionStorage to', SESSION_STORAGE_PATH);

await browser.close();
