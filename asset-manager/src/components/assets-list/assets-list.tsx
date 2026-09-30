import { FormattedMessage, useIntl } from 'react-intl';
import { Button, Heading, Stack } from '@commercetools/nimbus';
import { Add, Delete } from '@commercetools/nimbus-icons';
import messages from './messages';
import { FC, useState } from 'react';
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
  assets: Array<TAsset>;
  refetch: () => Promise<unknown>;
};

const AssetsList: FC<Props> = ({
  assets,
  onEdit,
  onCreate,
  onDelete,
  refetch,
}) => {
  const intl = useIntl();

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [asset, setAsset] = useState<TAsset | undefined>(undefined);
  const [isDeleteAssetOpen, setIsDeleteAssetOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Array<TAsset>>([]);

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
            <Stack direction="row" justify="flex-start">
              <Button
                variant="outline"
                colorPalette="critical"
                isDisabled={selectedAssets.length === 0}
                onPress={() => setIsDeleteAssetOpen(true)}
              >
                <Delete />
                {intl.formatMessage(messages.delete)}
              </Button>
            </Stack>
            <AssetTable
              items={assets}
              onSelectionChange={setSelectedAssets}
              onRowClick={(row) => {
                setAsset(row);
                setIsEditAssetOpen(true);
              }}
            />
          </Stack>
        ) : (
          <Heading as="h3" size="md">
            <FormattedMessage {...messages.noResults} />
          </Heading>
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
            selectedAssets={selectedAssets}
          />
        )}
      </Stack>
    </InfoMainPage>
  );
};
AssetsList.displayName = 'Assets';

export default AssetsList;
