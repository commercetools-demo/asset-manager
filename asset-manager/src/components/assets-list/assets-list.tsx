import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Button, Heading, Stack } from '@commercetools/nimbus';
import { Add } from '@commercetools/nimbus-icons';
import messages from './messages';
import { FC, useState } from 'react';
import { DOMAINS } from '@commercetools-frontend/constants';
import {
  TApiErrorNotificationOptions,
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { transformErrors } from '../assets-edit/transform-errors';
import DeleteAsset from '../assets-delete';
import AssetTable from '../assets-table';
import { InfoMainPage } from '@commercetools-frontend/application-components';
import AssetsCreate from '../assets-create';
import { TAsset, TAssetDraftInput } from '../../types/generated/ctp';
import AssetsEdit from '../assets-edit';

type Props = {
  onEdit: (
    draft: {
      name: { [locale: string]: string };
      description: { [locale: string]: string };
      sources?: Array<{
        uri?: string;
        key?: string;
        contentType?: string;
        dimensions?: { width?: number; height?: number };
      }>;
      key?: string;
      id?: string;
    },
    asset: TAsset
  ) => Promise<void>;
  onCreate: (draft: TAssetDraftInput) => Promise<void>;
  onDelete: (assets: Array<TAsset>) => Promise<void>;
  onSortFinish: (reordered: Array<TAsset>) => Promise<void>;
  assets: Array<TAsset>;
  refetch: () => Promise<unknown>;
};

const AssetsList: FC<Props> = ({
  assets,
  onEdit,
  onCreate,
  onDelete,
  onSortFinish,
  refetch,
}) => {
  const intl = useIntl();

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [asset, setAsset] = useState<TAsset | undefined>(undefined);
  const [isDeleteAssetOpen, setIsDeleteAssetOpen] = useState(false);
  const [assetsToDelete, setAssetsToDelete] = useState<Array<TAsset>>([]);
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();

  const handleReorder = async (reordered: Array<TAsset>) => {
    try {
      await onSortFinish(reordered);
      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.reorderSuccess),
      });
    } catch (graphQLErrors) {
      const { unmappedErrors } = transformErrors(graphQLErrors);
      showApiErrorNotification({
        errors: unmappedErrors as TApiErrorNotificationOptions['errors'],
      });
      throw graphQLErrors;
    } finally {
      await refetch();
    }
  };

  return (
    <InfoMainPage
      customTitleRow={
        <Stack direction="row" justify="space-between" align="center">
          <Heading as="h2" size="lg">
            {intl.formatMessage(messages.title)}
          </Heading>
          <Button
            variant="solid"
            colorPalette="primary"
            onPress={() => setIsAddAssetOpen(true)}
          >
            <Add />
            {intl.formatMessage(messages.addAsset)}
          </Button>
        </Stack>
      }
    >
      <Stack direction="column" gap="800">
        {assets.length > 0 ? (
          <Stack direction="column" gap="100" align="stretch">
            <AssetTable
              items={assets}
              onDeleteClick={(row) => {
                setAssetsToDelete([row]);
                setIsDeleteAssetOpen(true);
              }}
              onReorder={handleReorder}
              onRowClick={(row) => {
                setAsset(row);
                setIsEditAssetOpen(true);
              }}
            />
          </Stack>
        ) : (
          <Alert.Root colorPalette="info">
            <Alert.Description>
              <FormattedMessage {...messages.noResults} />
            </Alert.Description>
          </Alert.Root>
        )}
        {isAddAssetOpen && (
          <AssetsCreate
            onClose={async () => {
              await refetch();
              setIsAddAssetOpen(false);
            }}
            onCreate={onCreate}
          />
        )}
        {isEditAssetOpen && asset && (
          <AssetsEdit
            onClose={async () => {
              await refetch();
              setIsEditAssetOpen(false);
            }}
            asset={asset}
            onEdit={onEdit}
          />
        )}
        {isDeleteAssetOpen && (
          <DeleteAsset
            onClose={async () => {
              await refetch();
              setIsDeleteAssetOpen(false);
            }}
            onDelete={onDelete}
            selectedAssets={assetsToDelete}
          />
        )}
      </Stack>
    </InfoMainPage>
  );
};
AssetsList.displayName = 'Assets';

export default AssetsList;
