import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'Assets.title',
    defaultMessage: 'Assets list',
  },
  noResults: {
    id: 'Assets.noResults',
    defaultMessage: 'There are no assets yet.',
  },
  productNotFound: {
    id: 'Assets.productNotFound',
    defaultMessage: 'Product {productId} was not found in this project.',
  },
  variantNotFound: {
    id: 'Assets.variantNotFound',
    defaultMessage: 'Variant {variantId} was not found on product {productId}.',
  },
  categoryNotFound: {
    id: 'Assets.categoryNotFound',
    defaultMessage: 'Category {categoryId} was not found in this project.',
  },
  addAsset: {
    id: 'Assets.add',
    defaultMessage: 'Add an asset',
  },
  reorderSuccess: {
    id: 'Assets.reorderSuccess',
    defaultMessage: 'The asset order has been saved.',
  },
});
