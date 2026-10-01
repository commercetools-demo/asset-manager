/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomView}
 */
const config = {
  name: 'Asset Manager',
  description: 'Manage Assets for Product Variants and Categories.',
  cloudIdentifier: '${env:CLOUD_IDENTIFIER}',
  env: {
    development: {
      initialProjectKey: '${env:INITIAL_PROJECT_KEY}',
      hostUriPath:
        // '/tech-sales-good-store/products/df2018bd-7fa4-4a04-933d-5e2b97e1ff8e/variants/1/images',
        '/tech-sales-good-store/categories/fba234fa-cfc8-4506-ad91-dad0fe97dbc9/general',
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
