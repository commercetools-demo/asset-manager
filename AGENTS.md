# Asset Manager

## Purpose

Merchant Center Custom View (`CustomPanel`) for managing assets on product variants and categories. Deployed via commercetools Connect (`connect.yaml`, `applicationType: merchant-center-custom-view`).

## Key Context

- The app lives in `asset-manager/`; the repo root only holds Connect/CI config.
- Locators: `products.product_variant_details.general`, `products.product_variant_details.images`, `categories.category_details.general` (see `asset-manager/custom-view-config.mjs`).
- Has `@types/`, `@types-extensions/`, `schemas/` and a `tsconfig.json`; generated commercetools GraphQL types live in `src/types/generated/ctp.ts`.

## How To Work Here

```sh
cd asset-manager
npm install
npm start
npm test
npm run typecheck
npm run build
```
