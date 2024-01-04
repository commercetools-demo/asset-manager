import { lazy } from 'react';

const DeleteAsset = lazy(() =>
  import('./delete-asset' /* webpackChunkName: "delete-asset" */)
);

export default DeleteAsset;
