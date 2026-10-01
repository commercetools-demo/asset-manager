import { FC } from 'react';
import Assets from '../assets-list';
import {
  TAddCategoryAsset,
  TAsset,
  TAssetDraftInput,
} from '../../types/generated/ctp';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import {
  createGraphQlUpdateActions,
  getErrorMessage,
  toRestAsset,
  type TProductSyncAction,
  type TSyncProductDraft,
} from '../../helpers';
import { createSyncProducts } from '@commercetools/sync-actions';
import { FormattedMessage } from 'react-intl';
import { Alert, LoadingSpinner, Stack } from '@commercetools/nimbus';
import messages from '../assets-list/messages';
import { useCategoryFetcher, useCategoryUpdater } from '../../hooks';
// The category syncer turns any asset change into removeAsset + addAsset,
// which re-creates the asset with a new ID at the end of the list. The product
// syncer emits in-place asset actions instead, and categories support the same
// ones, so category assets are diffed as a single pseudo-variant.
const syncAssets = createSyncProducts();
const CATEGORY_ASSET_ACTIONS = [
  'changeAssetName',
  'setAssetDescription',
  'setAssetKey',
  'setAssetSources',
] as const;
type TCategoryAssetAction = Extract<
  TProductSyncAction,
  { action: (typeof CATEGORY_ASSET_ACTIONS)[number] }
>;
const isCategoryAssetAction = (
  action: TProductSyncAction
): action is TCategoryAssetAction =>
  (CATEGORY_ASSET_ACTIONS as ReadonlyArray<string>).includes(action.action);

type Props = { categoryId: string };

export const CategoryAssets: FC<Props> = ({ categoryId }) => {
  const categoryUpdater = useCategoryUpdater();

  const { loading, error, category, refetch } = useCategoryFetcher({
    id: categoryId,
  });

  if (error) {
    return (
      <Alert.Root colorPalette="critical">
        <Alert.Description>{getErrorMessage(error)}</Alert.Description>
      </Alert.Root>
    );
  }
  if (loading) {
    return (
      <Stack direction="column" align="center">
        <LoadingSpinner />
      </Stack>
    );
  }

  if (!category) {
    return (
      <Alert.Root colorPalette="warning">
        <Alert.Description>
          <FormattedMessage
            {...messages.categoryNotFound}
            values={{ categoryId }}
          />
        </Alert.Description>
      </Alert.Root>
    );
  }

  const onEdit = async (
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
  ) => {
    const before: TSyncProductDraft = {
      masterVariant: {
        id: 1,
        assets: [
          toRestAsset({
            id: asset.id,
            key: asset.key,
            name:
              transformLocalizedFieldToLocalizedString(
                asset.nameAllLocales || []
              ) ?? {},
            description:
              transformLocalizedFieldToLocalizedString(
                asset.descriptionAllLocales || []
              ) || {},
            sources: asset.sources,
          }),
        ],
      },
    };
    const now: TSyncProductDraft = {
      masterVariant: { id: 1, assets: [toRestAsset(draft)] },
    };

    const actions = syncAssets
      .buildActions(now, before)
      .filter(isCategoryAssetAction)
      .map(
        ({ variantId: _variantId, sku: _sku, staged: _staged, ...action }) =>
          action
      );
    await categoryUpdater.execute({
      id: categoryId,
      version: category.version,
      actions: createGraphQlUpdateActions(actions),
    });
  };
  const onCreate = async (draft: TAssetDraftInput) => {
    const addAssetAction: TAddCategoryAsset = {
      asset: draft,
    };

    await categoryUpdater.execute({
      id: categoryId,
      version: category.version,
      actions: [{ addAsset: addAssetAction }],
    });
  };
  const onDelete = async (toDelete: Array<TAsset>) => {
    await categoryUpdater.execute({
      id: categoryId,
      version: category.version,
      actions: toDelete.map((asset) => {
        return {
          removeAsset: {
            assetId: asset.id,
          },
        };
      }),
    });
  };
  const onSortFinish = async (reordered: Array<TAsset>) => {
    await categoryUpdater.execute({
      id: categoryId,
      version: category.version,
      actions: [
        {
          changeAssetOrder: {
            assetOrder: reordered.map((asset) => asset.id),
          },
        },
      ],
    });
  };
  return (
    <Assets
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
      onSortFinish={onSortFinish}
      assets={category.assets || []}
      refetch={refetch}
    />
  );
};

export default CategoryAssets;
