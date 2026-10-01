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
import { FormattedMessage } from 'react-intl';
import { Alert, LoadingSpinner, Stack } from '@commercetools/nimbus';
import messages from '../assets-list/messages';
import { useProductFetcher, useProductUpdater } from '../../hooks';
const syncProducts = createSyncProducts();

type Props = { productId: string; variantId: number };

export const ProductAssets: FC<Props> = ({ productId, variantId }) => {
  const productUpdater = useProductUpdater();

  const { loading, error, product, refetch } = useProductFetcher({
    id: productId,
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

  if (!product) {
    return (
      <Alert.Root colorPalette="info">
        <Alert.Description>
          <FormattedMessage {...messages.noResults} />
        </Alert.Description>
      </Alert.Root>
    );
  }

  const masterVariant = product.masterData?.current?.masterVariant;
  const variants = product.masterData?.current?.variants || [];
  const variant = [masterVariant, ...variants].find(
    (variant) => variant?.id === variantId
  );

  if (!loading && !variant) {
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
        key: variant?.key,
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
    await productUpdater.execute({
      id: productId,
      version: product.version,
      actions: [
        {
          changeAssetOrder: {
            variantId,
            assetOrder: reordered.map((asset) => asset.id),
            staged: false,
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
      assets={variant?.assets || []}
      refetch={refetch}
    />
  );
};

export default ProductAssets;
