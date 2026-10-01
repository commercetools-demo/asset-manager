// Captures the README/docs screenshots against a locally running dev server,
// reusing the session saved by login.mjs. Requires real data: the target
// product variant (and category, for MC_LOCATOR=category) needs at least one
// asset. This only navigates the UI — it never creates or modifies data.
//
// Usage: npm start (in the asset-manager/ app root, in another terminal), then:
//   npm install && npm run login && npm run capture

import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.MC_PORT || 3001;
const DATA_LOCALE = process.env.DATA_LOCALE || 'en-GB';
const BASE = `http://localhost:${PORT}/`;
const AUTH_STATE_PATH = path.join(__dirname, 'auth-state.json');
const SESSION_STORAGE_PATH = path.join(__dirname, 'session-storage.json');
const OUTPUT_DIR = path.join(__dirname, '..', '..', '..', 'docs');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  storageState: AUTH_STATE_PATH,
  viewport: { width: 1440, height: 900 },
});

// `storageState` doesn't cover sessionStorage, which this shell's silent-auth
// bootstrap depends on — see the comment in login.mjs. Replay it before any
// app script runs on every navigation in this context.
if (fs.existsSync(SESSION_STORAGE_PATH)) {
  const sessionStorageEntries = JSON.parse(
    fs.readFileSync(SESSION_STORAGE_PATH, 'utf8')
  );
  await context.addInitScript((entries) => {
    for (const [key, value] of Object.entries(entries)) {
      window.sessionStorage.setItem(key, value);
    }
  }, sessionStorageEntries);
} else {
  console.log(
    `WARNING: ${SESSION_STORAGE_PATH} not found — re-run "npm run login" first. ` +
      'Without it, the app is likely to hang in an auth-bootstrap retry loop.'
  );
}

// The Merchant Center's data-locale switcher persists its choice here; set it
// up front so localized fields (e.g. the edit form's name) show demo values.
await context.addInitScript((locale) => {
  window.localStorage.setItem('selectedDataLocale', locale);
}, DATA_LOCALE);

const page = await context.newPage();
page.on('pageerror', (err) => console.log('[pageerror]', err.message));

// The panel renders inside its own <iframe> within the dev-server's simulated
// host page; page.locator(...) only searches the outer document.
const panelFrame = page.frameLocator('iframe');
const panelElement = page.locator('iframe');

async function openCustomViewFromLoader() {
  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
  const link = page.getByText(/open the custom view/i).first();
  await link.waitFor({ state: 'visible', timeout: 10000 });
  // force: true — see the comment in login.mjs.
  await link.click({ force: true });
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1500);
}

async function shot(name) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(800);
  // Screenshot just the panel's <iframe> element — crops out the dev-only
  // "Custom View loader" chrome around it.
  await panelElement.screenshot({
    path: path.join(OUTPUT_DIR, name),
    type: 'png',
  });
  console.log('shot:', name);
}

// Rows are DraggableList items (a drag handle on the left, a delete button on
// the right), so click into the middle of the row to trigger its edit action.
async function clickFirstAssetRow() {
  const row = panelFrame.getByRole('row').first();
  await row.waitFor({ state: 'visible', timeout: 10000 });
  await row.click({ position: { x: 300, y: 12 } });
}

// Only one locator is reachable per dev-server run: the embedded context
// comes from custom-view-config.mjs's development.hostUriPath. Set
// MC_LOCATOR=product (default) or MC_LOCATOR=category to match it (restart
// `npm start` after switching), then re-run capture for the other.
const LOCATOR = process.env.MC_LOCATOR || 'product';

if (LOCATOR === 'product') {
  await openCustomViewFromLoader();
  await shot('product-assets.png');

  try {
    await clickFirstAssetRow();
    await page.waitForTimeout(1000);
    await shot('asset-edit.png');
  } catch (e) {
    console.log('asset-edit.png FAILED:', e.message);
  }

  try {
    await openCustomViewFromLoader();
    await panelFrame.getByRole('button', { name: /add an asset/i }).click();
    await page.waitForTimeout(1000);
    await shot('asset-create.png');
  } catch (e) {
    console.log('asset-create.png FAILED:', e.message);
  }
} else if (LOCATOR === 'category') {
  await openCustomViewFromLoader();
  await shot('category-assets.png');
} else {
  console.log(
    `Unknown MC_LOCATOR "${LOCATOR}" — expected "product" or "category".`
  );
}

await browser.close();
console.log('DONE');
