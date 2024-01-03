import { lazy } from 'react';

const Assets = lazy(() =>
  import('./assets' /* webpackChunkName: "assets" */)
);

export default Assets;
