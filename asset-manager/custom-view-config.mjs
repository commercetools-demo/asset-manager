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
        '/tech-sales-manufacturing-store/products/b12eb265-c174-4900-adc8-4aab0ec0ca5f/variants/1/images',
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
      locale: 'en',
      value: 'Asset Manager',
    },
  ],
  locators: [
    'products.product_variant_details.general',
    'products.product_variant_details.images',
    'categories.category_details.general',
  ],
};

export default config;
