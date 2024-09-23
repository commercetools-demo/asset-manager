import type { ReactNode } from 'react';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import ProductAssets from './components/product-assets';
import CategoryAssets from './components/category-assets';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const hostUrl = useCustomViewContext((context) => context.hostUrl);

  const [_, productId, variantId] =
    hostUrl.match('/products/([^/]+)/variants/([^/]+)') || [];

  const [__, categoryId] = hostUrl.match('/categories/([^/]+)/[^/]+') || [];

  if (!productId && !variantId && !categoryId) {
    return (
      <ContentNotification type="error">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }
  return (
    <>
      {productId && variantId && (
        <ProductAssets
          productId={productId}
          variantId={Number.parseInt(variantId, 10)}
        />
      )}
      {categoryId && <CategoryAssets categoryId={categoryId} />}
    </>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
