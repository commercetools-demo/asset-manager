import { lazy } from 'react';

const Assets = lazy(
  () => import('./product-assets' /* webpackChunkName: "product-assets" */)
);

export default Assets;
