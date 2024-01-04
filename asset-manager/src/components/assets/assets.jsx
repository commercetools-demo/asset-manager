import { useIntl } from 'react-intl';
import {
  useApplicationContext,
  useCustomViewContext,
} from '@commercetools-frontend/application-shell-connectors';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  useDataTableSortingState,
  useRowSelection,
} from '@commercetools-uikit/hooks';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable from '@commercetools-uikit/data-table';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import Text from '@commercetools-uikit/text';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useAsset } from '../../hooks/use-assets-connector';
import { getErrorMessage } from '../../helpers';
import messages from './messages';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { PlusThinIcon, BinFilledIcon } from '@commercetools-uikit/icons';
import SelectField from '@commercetools-uikit/select-field';
import { useMemo, useState } from 'react';
import AddAsset from '../add-asset';
import DeleteAsset from '../delete-asset';
import PrimaryActionDropdown, {
  Option,
} from '@commercetools-uikit/primary-action-dropdown';

const Assets = () => {
  const intl = useIntl();

  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isDeleteAssetOpen, setIsDeleteAssetOpen] = useState(false);
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

  const {
    rows: rowsWithSelection,
    toggleRow,
    selectAllRows,
    deselectAllRows,
    getIsRowSelected,
    getNumberOfSelectedRows,
  } = useRowSelection('checkbox', variant?.assets || []);

  const countSelectedRows = getNumberOfSelectedRows();
  const isSelectColumnHeaderIndeterminate =
    countSelectedRows > 0 && countSelectedRows < rowsWithSelection.length;
  const handleSelectColumnHeaderChange =
    countSelectedRows === 0 ? selectAllRows : deselectAllRows;

  const columns = [
    {
      key: 'checkbox',
      label: (
        <CheckboxInput
          isIndeterminate={isSelectColumnHeaderIndeterminate}
          isChecked={countSelectedRows !== 0}
          onChange={handleSelectColumnHeaderChange}
        />
      ),
      shouldIgnoreRowClick: true,
      align: 'center',
      renderItem: (row) => (
        <CheckboxInput
          isChecked={getIsRowSelected(row.id)}
          onChange={() => toggleRow(row.id)}
        />
      ),
      disableResizing: true,
    },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
    { key: 'url', label: 'URL' },
  ];

  const selectedAssets = useMemo(() => {
    return rowsWithSelection?.filter((row) => getIsRowSelected(row.id));
  }, [rowsWithSelection]);

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
        <Spacings.Stack scale="l" alignItems="stretch">
          <Spacings.Inline
            alignItems="flex-start"
            justifyContent="space-between"
          >
            <Spacings.Stack scale="s" alignItems="stretch">
              <PrimaryActionDropdown>
                <Option iconLeft={<></>} onClick={() => {}}>
                  {intl.formatMessage(messages.actions)}
                </Option>
                <Option
                  iconLeft={<BinFilledIcon />}
                  onClick={() => setIsDeleteAssetOpen(true)}
                  isDisabled={countSelectedRows === 0}
                >
                  <Spacings.Inline alignItems="center">
                    <BinFilledIcon />
                    Delete
                  </Spacings.Inline>
                </Option>
              </PrimaryActionDropdown>
            </Spacings.Stack>

            <PrimaryButton
              iconLeft={<PlusThinIcon />}
              label={intl.formatMessage(messages.addAsset)}
              onClick={() => setIsAddAssetOpen(true)}
              isDisabled={false}
            />
          </Spacings.Inline>

          <DataTable
            isCondensed
            columns={columns}
            rows={rowsWithSelection}
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
      {isDeleteAssetOpen && (
        <DeleteAsset
          onClose={() => setIsDeleteAssetOpen(false)}
          productId={productId}
          variantId={variantId}
          selectedAssets={selectedAssets}
        />
      )}
    </Spacings.Stack>
  );
};
Assets.displayName = 'Assets';

export default Assets;
