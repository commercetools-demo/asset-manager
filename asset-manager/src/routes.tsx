import type { ReactNode } from 'react';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { Alert } from '@commercetools/nimbus';
import { FormattedMessage } from 'react-intl';
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
      <Alert.Root colorPalette="critical">
        <Alert.Description>
          <FormattedMessage {...messages.noResults} />
        </Alert.Description>
      </Alert.Root>
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
