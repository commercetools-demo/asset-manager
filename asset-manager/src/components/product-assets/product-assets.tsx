import { FC } from 'react';
import Assets from '../assets-list';
import {
  TAddProductAsset,
  TAsset,
  TAssetDraftInput,
} from '../../types/generated/ctp';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { createGraphQlUpdateActions, getErrorMessage } from '../../helpers';
import { createSyncProducts } from '@commercetools/sync-actions';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import messages from '../assets-list/messages';
import {
  useProductFetcher,
  useProductUpdater,
} from 'commercetools-demo-shared-data-fetching-hooks';
const syncProducts = createSyncProducts();

type Props = { productId: string; variantId: number };

export const ProductAssets: FC<Props> = ({ productId, variantId }) => {
  const productUpdater = useProductUpdater();

  const { loading, error, product, refetch } = useProductFetcher({
    id: productId,
    includeAssets: true,
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
      masterVariant: {
        sku: variant?.sku,
        id: variant?.id,
        key: variant?.key,
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
      },
    };

    const now = {
      masterVariant: {
        sku: variant?.sku,
        id: variant?.id,
        assets: [
          // new image
          {
            ...draft,
          },
        ],
      },
    };

    const actions = syncProducts.buildActions(now, before);
    let translatedActions = createGraphQlUpdateActions(actions, {
      staged: false,
    });
    await productUpdater.execute({
      id: productId,
      version: product.version,
      actions: translatedActions,
    });
  };
  const onCreate = async (draft: TAssetDraftInput) => {
    const addAssetAction: TAddProductAsset = {
      asset: draft,
      variantId: variantId,
      staged: false,
    };

    await productUpdater.execute({
      id: productId,
      version: product.version,
      actions: [{ addAsset: addAssetAction }],
    });
  };
  const onDelete = async (toDelete: Array<TAsset>) => {
    await productUpdater.execute({
      id: productId,
      version: product.version,
      actions: toDelete.map((asset) => {
        return {
          removeAsset: {
            variantId: variantId,
            staged: false,
            assetId: asset.id,
          },
        };
      }),
    });
  };
  const onSortFinish = async (reordered: Array<TAsset>) => {
    const before = {
      masterVariant: {
        sku: variant?.sku,
        id: variant?.id,
        key: variant?.key,
        assets: variant?.assets.map((asset) => {
          return { id: asset.id };
        }),
      },
    };
    const now = {
      masterVariant: {
        sku: variant?.sku,
        id: variant?.id,
        key: variant?.key,
        assets: reordered.map((asset) => {
          return { id: asset.id };
        }),
      },
    };
    const actions = syncProducts.buildActions(now, before);
    await productUpdater.execute({
      id: productId,
      version: product.version,
      actions: createGraphQlUpdateActions(actions, {
        staged: false,
      }),
    });
  };
  return (
    <Assets
      onCreate={onCreate}
      onEdit={onEdit}
      onSortFinish={onSortFinish}
      onDelete={onDelete}
      assets={variant?.assets || []}
      refetch={refetch}
    />
  );
};

export default ProductAssets;
