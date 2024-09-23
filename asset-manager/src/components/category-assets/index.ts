import { lazy } from 'react';

const Assets = lazy(
  () => import('./category-assets' /* webpackChunkName: "category-assets" */)
);

export default Assets;
