const fs = require('fs');
const path = require('path');
const presetResolver = require('@commercetools-frontend/jest-preset-mc-app/module-exports-resolver');

// @commercetools/nimbus' CJS chunks `require("./X.cjs.js")` while the files on
// disk are named `X.cjs` (webpack uses the ESM build and never hits this).
module.exports = (request, options) => {
  if (request.startsWith('.') && request.endsWith('.cjs.js')) {
    const fallback = request.slice(0, -'.js'.length);
    const resolved = path.resolve(options.basedir, request);
    if (
      !fs.existsSync(resolved) &&
      fs.existsSync(path.resolve(options.basedir, fallback))
    ) {
      return presetResolver(fallback, options);
    }
  }
  return presetResolver(request, options);
};
