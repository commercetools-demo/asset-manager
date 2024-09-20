import { lazy } from 'react';

const Assets = lazy(
  () =>
    import(
      './assets-sortable-list' /* webpackChunkName: "assets-sortable-list" */
    )
);

export default Assets;
