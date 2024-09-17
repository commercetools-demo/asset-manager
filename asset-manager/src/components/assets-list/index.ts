import { lazy } from 'react';

const Assets = lazy(
  () => import('./assets-list' /* webpackChunkName: "assets" */)
);

export default Assets;
