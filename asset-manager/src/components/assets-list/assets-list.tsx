import { useIntl } from 'react-intl';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { DragDropIcon, PlusThinIcon } from '@commercetools-uikit/icons';
import { FC, useState } from 'react';
import DeleteAsset from '../assets-delete';
import SelectField from '@commercetools-uikit/select-field';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import AssetTable from '../assets-table';
import { InfoMainPage } from '@commercetools-frontend/application-components';
import AssetsCreate from '../assets-create';
import { TAsset, TAssetDraftInput, TQuery } from '../../types/generated/ctp';
import AssetsEdit from '../assets-edit';
import AssetsSortableList from '../assets-sortable-list';
import { ApolloQueryResult } from '@apollo/client';

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
  onSortFinish: (reordered: Array<TAsset>) => Promise<void>;
  onDelete: (assets: Array<TAsset>) => Promise<void>;
  assets: Array<TAsset>;
  refetch: () => Promise<ApolloQueryResult<TQuery>>;
};

const AssetsList: FC<Props> = ({
  assets,
  onEdit,
  onCreate,
  onSortFinish,
  onDelete,
  refetch,
}) => {
  const intl = useIntl();

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isEditAssetOpen, setIsEditAssetOpen] = useState(false);
  const [isReorder, setIsReorder] = useState(false);
  const [asset, setAsset] = useState<TAsset | undefined>(undefined);
  const [isDeleteAssetOpen, setIsDeleteAssetOpen] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Array<TAsset>>([]);
  const [selectedAction, setSelectedAction] = useState<'delete'>();

  return (
    <InfoMainPage
      customTitleRow={
        <Spacings.Inline justifyContent="space-between">
          <Text.Headline as="h2">
            {intl.formatMessage(messages.title)}
          </Text.Headline>
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
        {assets.length > 0 ? (
          <Spacings.Stack scale="xs" alignItems="stretch">
            <Spacings.Inline
              alignItems="flex-start"
              justifyContent="space-between"
            >
              <Spacings.Inline
                scale="s"
                justifyContent={'center'}
                alignItems={'flex-end'}
              >
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
                <SecondaryButton
                  iconLeft={<DragDropIcon />}
                  label={intl.formatMessage(
                    messages.reorderAttributesButtonLabel
                  )}
                  isToggleButton={true}
                  isToggled={isReorder}
                  onClick={() => setIsReorder(!isReorder)}
                />
              </Spacings.Inline>
            </Spacings.Inline>
            {assets.length > 0 && isReorder && (
              <AssetsSortableList
                items={assets}
                onClose={async () => {
                  await refetch();
                  setIsReorder(false);
                }}
                onSortFinish={onSortFinish}
              />
            )}
            {assets.length > 0 && !isReorder && (
              <AssetTable
                items={assets}
                onSelectionChange={setSelectedAssets}
                onRowClick={(row) => {
                  setAsset(row);
                  setIsEditAssetOpen(true);
                }}
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
            onClose={() => async () => {
              await refetch();
              setIsDeleteAssetOpen(false);
            }}
            onDelete={onDelete}
            selectedAssets={selectedAssets}
          />
        )}
      </Spacings.Stack>
    </InfoMainPage>
  );
};
AssetsList.displayName = 'Assets';

export default AssetsList;
