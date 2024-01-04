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
  demoHint: {
    id: 'Assets.demoHint',
    defaultMessage:
      'This page demonstrates how you can develop a component following some of the Merchant Center UX Guidelines and development best practices. For instance, fetching data using GraphQL, displaying data in a paginated table, writing functional tests, etc.',
  },
  noResults: {
    id: 'Assets.noResults',
    defaultMessage: 'There are no Assets available in this project.',
  },
  addAsset: {
    id: 'Assets.add',
    defaultMessage: 'Add an asset',
  },
});
