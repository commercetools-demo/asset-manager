import type { ReactNode } from 'react';
import {
  useApplicationContext,
  useCustomViewContext,
} from '@commercetools-frontend/application-shell-connectors';
import { Alert, NimbusI18nProvider } from '@commercetools/nimbus';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import ProductAssets from './components/product-assets';
import CategoryAssets from './components/category-assets';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const AssetsRoute = () => {
  const hostUrl = useCustomViewContext((context) => context.hostUrl);

  const [, productId, variantId] =
    hostUrl.match('/products/([^/]+)/variants/([^/]+)') || [];

  const [, categoryId] = hostUrl.match('/categories/([^/]+)/[^/]+') || [];

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

// Nimbus' built-in texts (field errors, "Show all languages", ...) follow the
// Merchant Center user's language; this needs the application context, so it
// can't live in the entry point outside the shell.
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const locale = useApplicationContext((context) => context.user?.locale);
  return (
    <NimbusI18nProvider locale={locale ?? 'en'}>
      <AssetsRoute />
    </NimbusI18nProvider>
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
