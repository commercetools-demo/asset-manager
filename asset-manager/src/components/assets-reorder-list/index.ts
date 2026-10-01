import { lazy } from 'react';

const AssetsReorderList = lazy(
  () =>
    import(
      './assets-reorder-list' /* webpackChunkName: "assets-reorder-list" */
    )
);

export default AssetsReorderList;
