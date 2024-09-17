import type { ReactNode } from 'react';
import Assets from './components/assets-list';
import { useCustomViewContext } from '@commercetools-frontend/application-shell-connectors';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import messages from './components/assets-list/messages';

type ApplicationRoutesProps = {
  children?: ReactNode;
};
const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const hostUrl = useCustomViewContext((context) => context.hostUrl);

  const [_, productId, variantId] =
    hostUrl.match('/products/([^/]+)/variants/([^/]+)') || [];

  if (!productId || !variantId) {
    return (
      <ContentNotification type="error">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }
  return (
    <Assets productId={productId} variantId={Number.parseInt(variantId, 10)} />
  );
};
ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
