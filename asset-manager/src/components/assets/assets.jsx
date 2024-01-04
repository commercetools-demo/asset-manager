import { useIntl } from 'react-intl';
import {
  useApplicationContext,
  useCustomViewContext,
} from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  usePaginationState,
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import Constraints from '@commercetools-uikit/constraints';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { Pagination } from '@commercetools-uikit/pagination';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useAssetFetcher } from '../../hooks/use-assets-connector';
import { getErrorMessage } from '../../helpers';
import messages from './messages';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'url', label: 'URL' },
];

const Assets = () => {
  const intl = useIntl();
  const user = useApplicationContext((context) => context.user);
  const dataLocale = useApplicationContext((context) => context.dataLocale);
  const projectLanguages = useApplicationContext(
    (context) => context.project?.languages
  );
  // const hostUrl = useCustomViewContext((context) => context.hostUrl);
  const hostUrl =
    'https://mc.us-central1.gcp.commercetools.com/us-store/products/17dcef5d-5506-4c3e-b27d-c1b450c44182/variants/1/images';

  const [_, productId, variantId] = hostUrl.match(
    '/products/([^/]+)/variants/([^/]+)/images'
  );

  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { variant, error, loading } = useAssetFetcher({
    productId,
    variantId,
  });

  console.log(variant);

  if (error || !productId || !variantId) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }

  if (!loading && !variant) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="s">
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      {loading && <LoadingSpinner />}

      {!!variant ? (
        <Spacings.Stack scale="l">
          <DataTable
            isCondensed
            columns={columns}
            rows={variant.assets}
            itemRenderer={(item, column) => {
              switch (column.key) {
                case 'name':
                  return formatLocalizedString(
                    {
                      name: transformLocalizedFieldToLocalizedString(
                        item.nameAllLocales ?? []
                      ),
                    },
                    {
                      key: 'name',
                      locale: dataLocale,
                      fallbackOrder: projectLanguages,
                      fallback: NO_VALUE_FALLBACK,
                    }
                  );
                case 'description':
                  return formatLocalizedString(
                    {
                      name: transformLocalizedFieldToLocalizedString(
                        item.descriptionAllLocales ?? []
                      ),
                    },
                    {
                      key: 'description',
                      locale: dataLocale,
                      fallbackOrder: projectLanguages,
                      fallback: NO_VALUE_FALLBACK,
                    }
                  );
                case 'url':
                  return item.sources.map((source) => source.uri).join(', ');
                default:
                  return null;
              }
            }}
            sortedBy={tableSorting.value.key}
            sortDirection={tableSorting.value.order}
            onSortChange={tableSorting.onChange}
          />
        </Spacings.Stack>
      ) : (
        <Spacings.Stack scale="s">
          <Text.Headline intlMessage={messages.noResults} />
        </Spacings.Stack>
      )}
    </Spacings.Stack>
  );
};
Assets.displayName = 'Channels';

export default Assets;
