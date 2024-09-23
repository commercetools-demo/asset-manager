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
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import messages from '../assets-list/messages';
import {
  useCategoryFetcher,
  useCategoryUpdater,
} from '../../hooks/use-category-connector';
const syncCategories = createSyncCategories();

type Props = { categoryId: string };

export const CategoryAssets: FC<Props> = ({ categoryId }) => {
  const categoryUpdater = useCategoryUpdater();

  const { loading, error, category, refetch } = useCategoryFetcher({
    id: categoryId,
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

  if (!category) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
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
  const onSortFinish = async (reordered: Array<TAsset>) => {
    const before = {
      id: category?.id,
      assets: category?.assets.map((asset) => {
        return { id: asset.id };
      }),
    };
    const now = {
      id: category?.id,
      assets: reordered.map((asset) => {
        return { id: asset.id };
      }),
    };
    const actions = syncCategories.buildActions(now, before);
    await categoryUpdater.execute({
      id: categoryId,
      version: category.version,
      actions: createGraphQlUpdateActions(actions),
    });
  };
  return (
    <Assets
      onCreate={onCreate}
      onEdit={onEdit}
      onSortFinish={onSortFinish}
      onDelete={onDelete}
      assets={category.assets || []}
      refetch={refetch}
    />
  );
};

export default CategoryAssets;
