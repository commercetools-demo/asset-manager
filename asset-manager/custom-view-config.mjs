/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomView}
 */
const config = {
  name: 'Asset Manager',
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    development: {
      initialProjectKey: 'tech-sales-manufacturing-store',
      hostUriPath:
      // '/tech-sales-manufacturing-store/products/b6f52a51-48b7-4509-b334-2e5ac8139d48/variants/1',
        '/tech-sales-manufacturing-store/categories/71df7924-79b8-42a2-af3d-cd424269de27/general',
    },
    production: {
      customViewId: '${env:CUSTOM_VIEW_ID}',
      url: '${env:APPLICATION_URL}',
    },
  },
  oAuthScopes: {
    view: ['view_products'],
    manage: ['manage_products'],
  },
  type: 'CustomPanel',
  typeSettings: {
    size: 'LARGE',
  },
  labelAllLocales: [
    {
      locale: "en",
      value: "Asset Manager"
    }
  ],
  locators: [
    'products.product_variant_details.general',
    'products.product_details.variants',
    'products.product_variant_details.images',
    'categories.category_details.general'
  ],
};

export default config;
