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
  additionalEnv: {
    CMS_API_URL: '${env:CMS_API_URL}',
  },
  headers: {
    csp: {
      'connect-src': ['*.us-central1.run.app']
    }
  },
  locators: [
    'products.product_variant_details.general',
    'products.product_variant_details.images',
    'categories.category_details.general',
  ],
};

export default config;
