import { lazy } from 'react';

const DeleteAsset = lazy(
  () => import('./assets-delete' /* webpackChunkName: "delete-asset" */)
);

export default DeleteAsset;
