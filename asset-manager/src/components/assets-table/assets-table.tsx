import { FC, useCallback, useMemo, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  Box,
  DraggableList,
  Flex,
  Grid,
  IconButton,
  Stack,
  Text,
} from '@commercetools/nimbus';
import { Delete } from '@commercetools/nimbus-icons';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TAsset } from '../../types/generated/ctp';
import messages from './messages';

type TAssetItem = { key: string; asset: TAsset };

const templateColumns =
  'minmax(0, 1fr) minmax(0, 2fr) minmax(0, 2fr) minmax(0, 3fr) max-content';

interface Props {
  items: Array<TAsset>;
  onDeleteClick: (asset: TAsset) => void;
  onRowClick: (row: TAsset) => void;
  onReorder: (reordered: Array<TAsset>) => Promise<void>;
}

const AssetsTable: FC<Props> = ({
  items,
  onDeleteClick,
  onRowClick,
  onReorder,
}) => {
  const intl = useIntl();
  // Bumped after a failed save to remount the list back to the server order.
  const [resetCount, setResetCount] = useState(0);

  const dataLocale = useApplicationContext(
    (context) => context.dataLocale ?? ''
  );
  const projectLanguages = useApplicationContext(
    (context) => context.project?.languages
  );

  const formatLocalizedField = (field: TAsset['descriptionAllLocales']) =>
    formatLocalizedString(
      { name: transformLocalizedFieldToLocalizedString(field ?? []) },
      {
        key: 'name',
        locale: dataLocale,
        fallbackOrder: projectLanguages ?? [],
        fallback: NO_VALUE_FALLBACK,
      }
    );

  // DraggableList resyncs whenever `items` changes identity, so the wrappers
  // must only be rebuilt when the assets themselves change.
  const draggableItems = useMemo(
    () => items.map((asset) => ({ key: asset.id, asset })),
    [items]
  );

  // DraggableList calls onUpdateItems on mount and whenever the handler's
  // identity changes, not only on drop — so keep it stable and only save
  // when the order actually differs from the server's.
  const latest = useRef({ items, onReorder });
  latest.current = { items, onReorder };
  const pendingOrder = useRef<string | null>(null);

  const handleUpdateItems = useCallback((updated: Array<TAssetItem>) => {
    const order = updated.map((item) => item.key).join(',');
    const savedOrder = latest.current.items.map((asset) => asset.id).join(',');
    if (order === savedOrder || order === pendingOrder.current) return;
    pendingOrder.current = order;
    latest.current
      .onReorder(updated.map((item) => item.asset))
      .catch(() => setResetCount((count) => count + 1))
      .finally(() => {
        pendingOrder.current = null;
      });
  }, []);

  const headers = [
    intl.formatMessage(messages.key),
    intl.formatMessage(messages.name),
    intl.formatMessage(messages.description),
    intl.formatMessage(messages.url),
  ];

  return (
    <Stack direction="column" gap="200">
      {/* Mirrors each row's drag handle (rendered by DraggableList.Item) so
          the header columns line up with the rows. */}
      <Flex align="center" gap="200" px="200">
        {/* Width of the row's 2xs drag handle. */}
        <Box aria-hidden flexShrink="0" width="600" />
        <Grid flex="1" minWidth="0" templateColumns={templateColumns} gap="300">
          {headers.map((header) => (
            <Text key={header} fontWeight="500" textStyle="sm">
              {header}
            </Text>
          ))}
          {/* Width of the row's xs delete button. */}
          <Box aria-hidden width="800" />
        </Grid>
      </Flex>
      <DraggableList.Root<TAssetItem>
        key={resetCount}
        aria-label={intl.formatMessage(messages.listLabel)}
        items={draggableItems}
        onUpdateItems={handleUpdateItems}
        onAction={(key) => {
          const asset = items.find((item) => item.id === key);
          if (asset) onRowClick(asset);
        }}
        width="full"
      >
        {({ asset }) => (
          <DraggableList.Item
            id={asset.id}
            textValue={asset.key || formatLocalizedField(asset.nameAllLocales)}
          >
            <Grid
              templateColumns={templateColumns}
              gap="300"
              alignItems="center"
              width="full"
              minWidth="0"
              cursor="pointer"
            >
              <Text truncate>{asset.key || NO_VALUE_FALLBACK}</Text>
              <Text truncate>{formatLocalizedField(asset.nameAllLocales)}</Text>
              <Text truncate color="neutral.11">
                {formatLocalizedField(asset.descriptionAllLocales)}
              </Text>
              <Text truncate color="neutral.11">
                {asset.sources.map((source) => source.uri).join(', ')}
              </Text>
              <IconButton
                aria-label={intl.formatMessage(messages.deleteAsset)}
                size="xs"
                variant="ghost"
                colorPalette="critical"
                onPress={() => onDeleteClick(asset)}
              >
                <Delete />
              </IconButton>
            </Grid>
          </DraggableList.Item>
        )}
      </DraggableList.Root>
    </Stack>
  );
};

export default AssetsTable;
