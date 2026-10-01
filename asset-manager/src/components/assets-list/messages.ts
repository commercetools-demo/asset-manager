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
  addAsset: {
    id: 'Assets.add',
    defaultMessage: 'Add an asset',
  },
  reorder: {
    id: 'Assets.reorder',
    defaultMessage: 'Reorder',
  },
  delete: {
    id: 'Assets.delete',
    defaultMessage: 'Delete',
  },
  createSuccess: {
    id: 'AddAsset.form.message.success',
    description: 'Success message for create type',
    defaultMessage: 'Your Asset has been created.',
  },
});
