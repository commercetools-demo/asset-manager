import { lazy } from 'react';

const AssetTable = lazy(() =>
  import('./asset-table' /* webpackChunkName: "asset-table" */)
);

export default AssetTable;
