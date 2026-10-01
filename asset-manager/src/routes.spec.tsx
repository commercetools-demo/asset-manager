import { screen } from '@commercetools-frontend/application-shell/test-utils';
import { renderAssetManager } from './test-utils/render';

it('should show a message on pages the asset manager does not support', async () => {
  await renderAssetManager('/orders/order-1/general');

  await screen.findByText('The Asset Manager is not available on this page.');
});
