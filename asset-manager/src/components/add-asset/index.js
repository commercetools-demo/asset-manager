import { lazy } from 'react';

const AddAsset = lazy(() =>
  import('./add-asset' /* webpackChunkName: "add-asset" */)
);

export default AddAsset;
