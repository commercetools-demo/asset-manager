import { FC } from 'react';
import Assets from '../assets-list';
import {
  TAddCategoryAsset,
  TAsset,
  TAssetDraftInput,
} from '../../types/generated/ctp';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { createGraphQlUpdateActions, getErrorMessage } from '../../helpers';
import { createSyncCategories } from '@commercetools/sync-actions';
import { FormattedMessage } from 'react-intl';
import { Alert, LoadingSpinner, Stack } from '@commercetools/nimbus';
import messages from '../assets-list/messages';
import {
  useCategoryFetcher,
  useCategoryUpdater,
} from 'commercetools-demo-shared-data-fetching-hooks';
const syncCategories = createSyncCategories();

type Props = { categoryId: string };

export const CategoryAssets: FC<Props> = ({ categoryId }) => {
  const categoryUpdater = useCategoryUpdater();

  const { loading, error, category, refetch } = useCategoryFetcher({
    id: categoryId,
    includeAssets: true,
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
      <Alert.Root colorPalette="info">
        <Alert.Description>
          <FormattedMessage {...messages.noResults} />
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
    const before = {
      id: category?.id,
      assets: [
        {
          name: transformLocalizedFieldToLocalizedString(
            asset?.nameAllLocales || []
          ),
          description:
            transformLocalizedFieldToLocalizedString(
              asset?.descriptionAllLocales || []
            ) || {},
          sources: asset?.sources,
          id: asset.id,
          key: asset?.key,
        },
      ],
    };

    const now = {
      id: category?.id,
      assets: [
        // new image
        {
          ...draft,
        },
      ],
    };

    const actions = syncCategories.buildActions(now, before).flat();
    let translatedActions = createGraphQlUpdateActions(actions);
    await categoryUpdater.execute({
      id: categoryId,
      version: category.version,
      actions: translatedActions,
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
  return (
    <Assets
      onCreate={onCreate}
      onEdit={onEdit}
      onDelete={onDelete}
      assets={category.assets || []}
      refetch={refetch}
    />
  );
};

export default CategoryAssets;
