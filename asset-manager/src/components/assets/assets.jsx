import { useIntl } from 'react-intl';
import {
  useApplicationContext,
  useCustomViewContext,
} from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  useDataTableSortingState,
} from '@commercetools-uikit/hooks';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useAsset } from '../../hooks/use-assets-connector';
import { getErrorMessage } from '../../helpers';
import messages from './messages';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { PlusThinIcon } from '@commercetools-uikit/icons';
import { useState } from 'react';
import AddAsset from '../add-asset';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'description', label: 'Description' },
  { key: 'url', label: 'URL' },
];

const Assets = () => {
  const intl = useIntl();

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const dataLocale = useApplicationContext((context) => context.dataLocale);
  const projectLanguages = useApplicationContext(
    (context) => context.project?.languages
  );

  const { env, testURL } = useApplicationContext(
    (context) => context.environment
  );

  const hostUrl = useCustomViewContext((context) => context.hostUrl);
  const currentUrl = env === 'development' ? testURL : hostUrl;

  const [_, productId, variantId] = currentUrl.match(
    '/products/([^/]+)/variants/([^/]+)/images'
  );

  const tableSorting = useDataTableSortingState({ key: 'key', order: 'asc' });
  const { variant, error, loading } = useAsset({
    productId,
    variantId,
  });

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
        <Spacings.Stack scale="l" alignItems="flex-start">
          <PrimaryButton
            iconLeft={<PlusThinIcon />}
            label={intl.formatMessage(messages.addAsset)}
            onClick={() => setIsAddAssetOpen(true)}
            isDisabled={false}
          />
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
      {isAddAssetOpen && (
        <AddAsset
          onClose={() => setIsAddAssetOpen(false)}
          productId={productId}
          variantId={variantId}
        />
      )}
    </Spacings.Stack>
  );
};
Assets.displayName = 'Assets';

export default Assets;
