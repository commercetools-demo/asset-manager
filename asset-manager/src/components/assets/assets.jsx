import { useIntl } from 'react-intl';
import {
  useApplicationContext,
  useCustomViewContext,
} from '@commercetools-frontend/application-shell-connectors';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { useAsset } from '../../hooks/use-assets-connector';
import { getErrorMessage } from '../../helpers';
import messages from './messages';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { PlusThinIcon } from '@commercetools-uikit/icons';
import { useState } from 'react';
import AddAsset from '../add-asset';
import DeleteAsset from '../delete-asset';
import SelectField from '@commercetools-uikit/select-field';

import AssetTable from '../asset-table';

const Assets = () => {
  const intl = useIntl();

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isDeleteAssetOpen, setIsDeleteAssetOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState([]);

  const { env, testURL } = useApplicationContext(
    (context) => context.environment
  );

  const hostUrl = useCustomViewContext((context) => context.hostUrl);
  const currentUrl = env === 'development' ? testURL : hostUrl;

  const [_, productId, variantId] = currentUrl.match(
    '/products/([^/]+)/variants/([^/]+)'
  );

  const { variant, error, loading } = useAsset({
    productId,
    variantId,
  });

  if (error || !productId || !variantId) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (!loading && !variant) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="s">
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      {loading && <LoadingSpinner />}

      {!!variant ? (
        <Spacings.Stack scale="l" alignItems="stretch">
          <Spacings.Inline
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Spacings.Stack scale="s" alignItems="stretch">
              <SelectField
                title="Actions"
                value="null"
                isDisabled={selectedAssets.length === 0}
                options={[
                  { value: 'delete', label: 'Delete' },
                ]}
                onChange={() => setIsDeleteAssetOpen(true)}
              />
            </Spacings.Stack>

            <PrimaryButton
              iconLeft={<PlusThinIcon />}
              label={intl.formatMessage(messages.addAsset)}
              onClick={() => setIsAddAssetOpen(true)}
              isDisabled={false}
            />
          </Spacings.Inline>

          {!!variant.assets && variant.assets.length > 0 && (
            <AssetTable
              items={variant.assets}
              onSelectionChange={setSelectedAssets}
            />
          )}
        </Spacings.Stack>
      ) : (
        <Spacings.Stack scale="s">
          <Text.Headline intlMessage={messages.noResults} />
        </Spacings.Stack>
      )}
      {isAddAssetOpen && (
        <AddAsset
          onClose={() => setIsAddAssetOpen(false)}
          productId={productId}
          variantId={variantId}
        />
      )}
      {isDeleteAssetOpen && (
        <DeleteAsset
          onClose={() => setIsDeleteAssetOpen(false)}
          productId={productId}
          variantId={variantId}
          selectedAssets={selectedAssets}
        />
      )}
    </Spacings.Stack>
  );
};
Assets.displayName = 'Assets';

export default Assets;
