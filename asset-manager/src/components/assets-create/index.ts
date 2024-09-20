import { lazy } from 'react';

const DeleteAsset = lazy(
  () => import('./assets-create' /* webpackChunkName: "assets-create" */)
);

export default DeleteAsset;
