import { lazy } from 'react';

const Assets = lazy(
  () => import('./assets-edit' /* webpackChunkName: "assets-edit" */)
);

export default Assets;
