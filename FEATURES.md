# Features

Code-derived inventory of what this repo implements. Bullets and key file paths;
setup and deployment steps live in `README.md`.

_Last generated: 2026-10-01._

This repo is a commercetools Merchant Center Custom View (`connect.yaml`,
`applicationType: merchant-center-custom-view`) of type `CustomPanel` (size `LARGE`)
for managing [Assets](https://docs.commercetools.com/api/types#asset) on Product
Variants and Categories, which have no first-class asset editor in the Merchant Center.
The app code lives under `asset-manager/` (an npm / `@commercetools-frontend`
`mc-scripts` project, UI built with `@commercetools/nimbus`). Data access is inlined
in `src/hooks/` (`useMcQuery`/`useMcMutation` with `.ctp.graphql` documents) rather
than depending on shared `commercetools-demo-shared-*` packages.

## Entry points

- The panel registers for three locators: Product Variant details **General** and
  **Images**, and Category details **General** (`custom-view-config.mjs`).
- The route parses the host URL for `/products/<id>/variants/<id>` or
  `/categories/<id>/…` and renders the product or category view; any other page
  shows a "not available on this page" alert (`src/routes.tsx`).
- Product, variant and category not-found cases get distinct warning alerts with the
  ID, separate from the "no assets yet" state
  (`components/product-assets/product-assets.tsx`,
  `components/category-assets/category-assets.tsx`).

## Asset list

- Lists the assets of the current Product Variant or Category with key, localized
  name, localized description and source URLs, using the project's `dataLocale` and
  language fallback order (`components/assets-table/assets-table.tsx`).
- Built as a Nimbus `DraggableList`: drag a row to **reorder**; the new order is saved
  on drop via a single `changeAssetOrder` action (product: with `variantId` and
  `staged: false`), and the list reverts to the server order if the save fails
  (`assets-table.tsx`, `assets-list/assets-list.tsx`, `product-assets.tsx`,
  `category-assets.tsx`).
- Click a row to **edit**; each row has a **delete** button that opens a
  confirmation dialog (`assets-delete/assets-delete.tsx`), which sends a
  `removeAsset` action.

## Create and edit assets

- Create and edit forms in a Merchant Center `FormModalPage`
  (`assets-create/assets-create.tsx`, `assets-edit/assets-edit.tsx`) sharing one
  Formik form (`asset-form/asset-form.tsx`): localized name (required) and
  description via Nimbus `LocalizedField`, and an optional key.
- Sources editor with one row per source: key, URI (required), width, height and
  content type, plus add/remove rows; the last row can't be removed, and new assets
  start with one empty source row because the API requires sources
  (`assets-sources-form/assets-sources-form.tsx`).
- Validation: key must be 2–256 characters of `[a-zA-Z0-9-_]`; name must not be
  empty; each source needs a URI; width and height must be set together
  (`asset-form.tsx`). API errors are shown as Merchant Center notifications
  (`assets-create/transform-errors.ts`, `assets-edit/transform-errors.ts`).
- Creating sends `addAsset`. Editing updates the asset in place with
  `changeAssetName` / `setAssetDescription` / `setAssetKey` / `setAssetSources`,
  computed with `@commercetools/sync-actions` and converted to GraphQL update actions
  (`src/helpers.ts:createGraphQlUpdateActions`); product changes are applied to the
  current data (`staged: false`).
- Category assets are diffed with the *product* syncer as a single pseudo-variant:
  the category syncer replaces any changed asset with `removeAsset` + `addAsset`,
  which would give it a new ID and move it to the end of the list
  (`category-assets/category-assets.tsx`).

## Data access

- Product and category fetch/update hooks with hand-narrowed result types (the full
  generated types hit TypeScript's instantiation depth limit)
  (`src/hooks/use-product-connector`, `src/hooks/use-category-connector`).
- Apollo cache stores `ProductVariant` objects inside their parent product
  (`keyFields: false`), because variant IDs are only unique within a product
  (`components/entry-point/entry-point.tsx`).
- GraphQL documents are linted against `schemas/ctp.json` with
  `@graphql-eslint/eslint-plugin` (`eslint.config.js`); `generate-types:ctp` logs into
  the Merchant Center and regenerates the schema and `src/types/generated/ctp.ts`
  (`codegen.ctp.yml`, `scripts/login.js`, `scripts/load-env.js`).

## Localization and permissions

- UI is translated for English and German (`src/i18n/data/en.json`, `de.json`,
  extracted into `core.json` via `extract-intl`), including ICU plurals for the delete
  messages.
- Nimbus' built-in texts follow the Merchant Center user's language
  (`NimbusI18nProvider` in `src/routes.tsx`).
- The view requests `view_products` and `manage_products` (`custom-view-config.mjs`).
  There are no in-app permission checks: create, edit, reorder and delete controls
  are always shown, and the API rejects writes without `manage_products`.

## Deployment and configuration

- Ships as a commercetools Connect application
  (`applicationType: merchant-center-custom-view`) with standard configuration for
  `CUSTOM_VIEW_ID` and `CLOUD_IDENTIFIER` (default `gcp-eu`) (`connect.yaml`).
- Pushing a git tag runs `.github/workflows/tag-push-workflow.yml`, which points the
  Connect draft at that tag and marks it previewable.
- Local development via `.env.local` + `npm start` against a real project; the
  embedded page comes from `custom-view-config.mjs`'s `development.hostUriPath`
  (`README.md`).
- Playwright scripts regenerate the README screenshots against a logged-in local
  session (`scripts/screenshots/`).
- `netlify.toml` SPA rewrite (`/* -> /index.html`) for static preview hosting.

## Known limitations (stated in code/docs)

- Asset tags, custom fields (`custom`) and asset types are not shown or editable.
- Edits apply to current product data only; there is no staged/draft mode.
- Two quick reorders in a row can hit a version conflict on the second save (shown
  as an API error; the list reverts).
- Only one context (product variant or category) is reachable per local dev-server
  run, set by `development.hostUriPath`.
- No automated tests (`npm test` finds none).
