import { lazy } from 'react';

const AssetTable = lazy(
  () => import('./assets-table' /* webpackChunkName: "asset-table" */)
);

export default AssetTable;
