import { FC, useState } from 'react';
import { arrayMove, SortEndHandler } from 'react-sortable-hoc';
import { TAsset, TProductVariant } from '../../types/generated/ctp';
import AssetsSortGrid from '../assets-sort-grid/assets-sort-grid';
import Spacings from '@commercetools-uikit/spacings';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { FormModalPage } from '@commercetools-frontend/application-components';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { useIntl } from 'react-intl';
import { createSyncProducts } from '@commercetools/sync-actions';
import { createGraphQlUpdateActions } from '../../helpers';
import { DOMAINS } from '@commercetools-frontend/constants';
import messages from '../assets-edit/messages';
import {
  TApiErrorNotificationOptions,
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { useProductUpdater } from '../../hooks/use-assets-connector';
import { transformErrors } from '../assets-edit/transform-errors';
const syncProducts = createSyncProducts();

type Props = {
  items: Array<TAsset>;
  variant: TProductVariant;
  onClose: () => Promise<void>;
  productId: string;
  version: number;
};

export const AssetsSortableList: FC<Props> = ({
  items,
  variant,
  onClose,
  productId,
  version,
}) => {
  const intl = useIntl();
  const [reorderedProducts, setReorderedProducts] =
    useState<Array<TAsset & { isMoved?: boolean }>>(items);
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const productUpdater = useProductUpdater();

  const onSave = async () => {
    try {
      const before = {
        masterVariant: {
          sku: variant?.sku,
          id: variant?.id,
          key: variant?.key,
          assets: items.map((asset) => {
            return { id: asset.id };
          }),
        },
      };
      const now = {
        masterVariant: {
          sku: variant?.sku,
          id: variant?.id,
          key: variant?.key,
          assets: reorderedProducts.map((asset) => {
            return { id: asset.id };
          }),
        },
      };
      const actions = syncProducts.buildActions(now, before);
      await productUpdater.execute({
        id: productId,
        version: version,
        actions: createGraphQlUpdateActions(actions),
      });

      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.createSuccess),
      });
      await onClose();
    } catch (graphQLErrors) {
      const transformedErrors = transformErrors(graphQLErrors);
      if (transformedErrors.unmappedErrors.length > 0) {
        showApiErrorNotification({
          errors:
            transformedErrors.unmappedErrors as TApiErrorNotificationOptions['errors'],
        });
      }
    }
  };
  const handleSortEnd: SortEndHandler = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;

    let listWithMovedProducts = arrayMove(
      reorderedProducts,
      oldIndex,
      newIndex
    );

    listWithMovedProducts[newIndex] = {
      ...listWithMovedProducts[newIndex],
      isMoved: true,
    };

    function checkAndUpdateIsMovedProperty(
      products: Array<TAsset & { isMoved?: boolean }>
    ) {
      return products.map((product, index) => {
        if (product.isMoved) {
          const isMovedToOriginalPosition = product.id === items[index].id;
          return { ...product, isMoved: !isMovedToOriginalPosition };
        }
        return product;
      });
    }

    setReorderedProducts(checkAndUpdateIsMovedProperty(listWithMovedProducts));
  };
  return (
    <>
      <Spacings.Inline
        scale="s"
        justifyContent={'flex-end'}
        alignItems={'flex-end'}
      >
        <SecondaryButton
          label={intl.formatMessage(FormModalPage.Intl.revert)}
          onClick={() => setReorderedProducts(items)}
        />
        <PrimaryButton
          label={intl.formatMessage(FormModalPage.Intl.save)}
          onClick={() => onSave()}
        />
      </Spacings.Inline>
      <AssetsSortGrid
        onSortEnd={handleSortEnd}
        axis="xy"
        items={reorderedProducts}
        itemPerRow={2}
        listType={'list'}
      />
    </>
  );
};

export default AssetsSortableList;
