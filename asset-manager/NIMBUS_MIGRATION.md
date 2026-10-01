# UI Kit → Nimbus migration notes

Notes from migrating this Custom View from `@commercetools-uikit/*` to
`@commercetools/nimbus`. Read this before touching Nimbus in this repo again.

## Dependencies

```
@chakra-ui/react   ^3.36.1
@commercetools/nimbus         3.4.0
@commercetools/nimbus-icons   ^3.4.0
@commercetools/nimbus-tokens  ^3.4.0
slate, slate-dom, slate-history, slate-hyperscript, slate-react
```

- `slate*` packages are required peer dependencies of `@commercetools/nimbus`
  even though this app doesn't use `RichTextInput` — Nimbus's bundle pulls
  the component in regardless, and `esbuild`-based tooling (see chakra
  typegen below) will fail to resolve the module without them.
- `react-redux@7.2.9`'s peer range doesn't cover React 19. Worked around with
  `legacy-peer-deps=true` in `.npmrc`.

## Provider wiring

`NimbusProvider` + `NimbusI18nProvider` wrap `CustomViewShell` in
`src/components/entry-point/entry-point.tsx`.

## Regenerating Chakra's styled-system types

```
npm run generate-types:chakra
```

This also runs automatically as a `postinstall` hook, so a fresh install or
dependency bump regenerates the types.

**Do not run `npx @chakra-ui/cli typegen ...`** — `npx` fetches an isolated
copy that can't see this project's `node_modules` and always fails with
`Cannot find module '@chakra-ui/react'`. The `chakra` binary is already
installed locally (a transitive dependency of Nimbus).

As of Nimbus 3.4.0 typegen also needs a DOM shim: Nimbus's bundle touches
`document`/`window` at import time, which crashes in plain Node. The script
preloads `scripts/chakra-typegen-dom-shim.cjs` (backed by `jsdom`) via
`node -r`. If it breaks after a Nimbus bump with a *different* missing
browser global, extend the shim.

## Nimbus quirks hit during migration

- **`Text` has no `size` prop.** Use `textStyle` or `fontSize`.
- **Nimbus `LocalizedString` allows `undefined` values**
  (`{ [locale: string]: string | undefined }`), while
  `@commercetools-frontend/l10n` expects `Record<string, string>`.
  `src/helpers.ts` wraps `LocalizedField.omitEmptyTranslations` /
  `createLocalizedString` with the narrower return type (both only ever
  return strings).
- **Nimbus inputs' `onChange` receives the value, not an event.** Formik's
  `handleChange` can't be passed directly; use `formik.setFieldValue(...)`.
  `LocalizedField`'s event carries the locale in `event.target.locale`.
- **`NumberInput` value must be a number.** Empty is `NaN`; the sources form
  maps `NaN` back to `undefined` before storing it in Formik.
- **Avoid `key` as a Nimbus DataTable column id.** In this app it made the
  header collect no columns ("Cell count must match column count").
- **DraggableList calls `onUpdateItems` on mount and whenever the handler
  changes identity**, not only on drop. `assets-table.tsx` keeps the handler
  stable and only saves when the order differs from the server's.

## Component mapping used

| UI Kit | Nimbus |
| --- | --- |
| `Spacings.Stack` / `Spacings.Inline` | `Stack` (`direction="column"` / `"row"`) |
| `Text.Body` / `Text.Headline` | `Text` / `Heading` |
| `ContentNotification` | `Alert.Root` + `Alert.Description` (`colorPalette` replaces `type`) |
| `PrimaryButton` / `SecondaryButton` | `Button` (`variant="solid"` / `"outline"`, `colorPalette="primary"`) |
| `IconButton` | `IconButton` (icon as child, `aria-label`) |
| `Card` | `Card.Root` + `Card.Body` |
| `Grid` + `designTokens` | `Grid` (`templateColumns`, `gap` tokens) |
| `LocalizedTextField` / `LocalizedTextInput` statics | `LocalizedField` (+ its `isEmpty`/`createLocalizedString`/`omitEmptyTranslations` statics) |
| `TextField` | `TextInputField` (`errors` + `renderError` kept) |
| `TextInput` / `NumberInput` + `ErrorMessage` | `TextInput` / `NumberInput` + `FieldErrors` |
| `DataTable` + `useRowSelection` + `CheckboxInput`, and the separate `react-sortable-hoc` reorder mode | `DraggableList.Root` with `selectionMode="multiple"`: drag to reorder (saved on drop), checkboxes for delete, `onAction` opens edit |
| Sources `DataTable` with inputs | `Grid` of inputs |
| `SelectField` "Actions" (single `Delete` option) | a `Delete` `Button`, disabled until rows are selected |
| `@commercetools-uikit/icons` | `@commercetools/nimbus-icons` (`Add`, `Delete`) |

Spacing conversions (UI Kit scale → Nimbus token): `xs`→`100`, `s`→`200`,
`m`→`400`, `l`→`600`, `xl`→`800`.

## Scope

Every `@commercetools-uikit/*` dependency and import has been removed.

## Data fetching and generated types

The hooks previously imported from `commercetools-demo-shared-data-fetching-hooks`
(`useProductFetcher`, `useCategoryFetcher`, `useCategoryUpdater`) are inlined
into `src/hooks/use-product-connector` and `src/hooks/use-category-connector`,
using `useMcQuery`/`useMcMutation` with `.ctp.graphql` documents. Result types
are hand-narrowed to the fragment shape instead of the full generated
`TQuery`/`TProduct` types, which are recursive enough to hit TypeScript's
instantiation depth limit (TS2589).

`npm run generate-types:ctp` regenerates `schemas/ctp.json` and
`src/types/generated/ctp.ts`: `scripts/login.js` logs into the Merchant Center
(needs `CLOUD_IDENTIFIER` and `CTP_PROJECT_KEY` in `.env`/`.env.local`) and
`scripts/load-env.js` reads the token back out of
`~/.commercetools/mc-credentials.json`.

`package.json` `overrides` force every nested `react`/`react-dom`/`@apollo/client`
to the root version: with `legacy-peer-deps=true`, npm otherwise silently nests
private copies under packages whose peer ranges don't cover React 19, which
crashes at runtime with duplicate-React errors.
