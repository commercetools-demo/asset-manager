import { useIntl } from 'react-intl';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { getErrorMessage } from '../../helpers';
import messages from './messages';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { PlusThinIcon } from '@commercetools-uikit/icons';
import { FC, useState } from 'react';
import DeleteAsset from '../assets-delete';
import SelectField from '@commercetools-uikit/select-field';
import AssetTable from '../assets-table';
import { InfoMainPage } from '@commercetools-frontend/application-components';
import AssetsCreate from '../assets-create/assets-create';
import { TAsset } from '../../types/generated/ctp';
import { useProductFetcher } from '../../hooks/use-assets-connector';

type Props = { productId: string; variantId: number };

const AssetsList: FC<Props> = ({ productId, variantId }) => {
  const intl = useIntl();

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isDeleteAssetOpen, setIsDeleteAssetOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Array<TAsset>>([]);
  const [selectedAction, setSelectedAction] = useState<'delete'>();

  const { loading, error, product, refetch } = useProductFetcher({
    id: productId,
  });

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (!product) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  const masterVariant = product.masterData?.current?.masterVariant;
  const variants = product.masterData?.current?.variants || [];
  const variant = [masterVariant, ...variants].find(
    (variant) => variant?.id === variantId
  );

  if (!loading && !variant) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  return (
    <InfoMainPage
      title={intl.formatMessage(messages.title)}
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2">Customer View</Text.Headline>
          <Spacings.Inline justifyContent="space-between">
            <PrimaryButton
              iconLeft={<PlusThinIcon />}
              label={intl.formatMessage(messages.addAsset)}
              onClick={() => setIsAddAssetOpen(true)}
              isDisabled={false}
            />
          </Spacings.Inline>
        </Spacings.Inline>
      }
    >
      <Spacings.Stack scale="xl">
        {!!variant ? (
          <Spacings.Stack scale="l" alignItems="stretch">
            <Spacings.Inline
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Spacings.Stack scale="s" alignItems="stretch">
                <SelectField
                  name={'actions'}
                  title={''}
                  horizontalConstraint={5}
                  placeholder={'Actions'}
                  options={[{ value: 'delete', label: 'Delete' }]}
                  onChange={(event) => {
                    setSelectedAction(event.target.value as 'delete');
                    setIsDeleteAssetOpen(true);
                  }}
                  isDisabled={selectedAssets.length === 0}
                  value={selectedAction}
                />
              </Spacings.Stack>
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
          <AssetsCreate
            onClose={async () => {
              await refetch();
              setIsAddAssetOpen(false);
            }}
            productId={productId}
            variantId={variantId}
            version={product.version}
          />
        )}
        {isDeleteAssetOpen && (
          <DeleteAsset
            onClose={() => async () => {
              await refetch();
              setIsDeleteAssetOpen(false);
            }}
            productId={productId}
            variantId={variantId}
            version={product.version}
            selectedAssets={selectedAssets}
          />
        )}
      </Spacings.Stack>
    </InfoMainPage>
  );
};
AssetsList.displayName = 'Assets';

export default AssetsList;
