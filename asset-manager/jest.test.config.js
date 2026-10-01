process.env.ENABLE_NEW_JSX_TRANSFORM = 'true';

const preset = require('@commercetools-frontend/jest-preset-mc-app/typescript/jest-preset');

/**
 * @type {import('@jest/types').Config.ProjectConfig}
 */
module.exports = {
  preset: '@commercetools-frontend/jest-preset-mc-app/typescript',
  resolver: '<rootDir>/jest.resolver.js',
  setupFiles: [
    ...preset.setupFiles,
    '@commercetools/nimbus/setup-jsdom-polyfills',
  ],
  // The preset only allowlists a top-level `node_modules/uuid`; app-kit nests
  // its own ESM-only copy, so match `uuid` at any depth.
  transformIgnorePatterns: [
    'node_modules/(?!(.*/node_modules/)?(uuid|@faker-js/faker|\\.pnpm)/)',
  ],
};
