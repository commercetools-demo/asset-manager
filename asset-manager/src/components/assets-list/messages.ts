import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'Assets.title',
    defaultMessage: 'Assets list',
  },
  subtitle: {
    id: 'Assets.subtitle',
    defaultMessage: 'Logged-id user: {firstName} {lastName}',
  },
  noResults: {
    id: 'Assets.noResults',
    defaultMessage: 'There are no Assets available for this variant.',
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
  createSuccess: {
    id: 'AddAsset.form.message.success',
    description: 'Success message for create type',
    defaultMessage: 'Your Asset has been created.',
  },
});
