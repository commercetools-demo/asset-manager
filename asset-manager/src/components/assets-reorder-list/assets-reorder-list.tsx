import { FC, useState } from 'react';
import { useIntl } from 'react-intl';
import { Button, DraggableList, Stack, Text } from '@commercetools/nimbus';
import { FormModalPage } from '@commercetools-frontend/application-components';
import {
  TApiErrorNotificationOptions,
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { DOMAINS, NO_VALUE_FALLBACK } from '@commercetools-frontend/constants';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { TAsset } from '../../types/generated/ctp';
import { transformErrors } from '../assets-edit/transform-errors';
import messages from './messages';

type TReorderItem = { key: string; label: string; asset: TAsset };

type Props = {
  items: Array<TAsset>;
  onClose: () => Promise<void>;
  onSortFinish: (reordered: Array<TAsset>) => Promise<void>;
};

export const AssetsReorderList: FC<Props> = ({
  items,
  onClose,
  onSortFinish,
}) => {
  const intl = useIntl();
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();
  const { dataLocale, projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    projectLanguages: context.project?.languages ?? [],
  }));

  const formatLocalizedField = (field: TAsset['descriptionAllLocales']) =>
    formatLocalizedString(
      { name: transformLocalizedFieldToLocalizedString(field ?? []) },
      {
        key: 'name',
        locale: dataLocale,
        fallbackOrder: projectLanguages,
        fallback: NO_VALUE_FALLBACK,
      }
    );

  const toReorderItems = (assets: Array<TAsset>): Array<TReorderItem> =>
    assets.map((asset) => ({
      key: asset.id,
      label: formatLocalizedField(asset.nameAllLocales),
      asset,
    }));

  const [reorderedItems, setReorderedItems] = useState(() =>
    toReorderItems(items)
  );
  const isDirty = reorderedItems.some(
    (item, index) => item.key !== items[index]?.id
  );

  const save = async () => {
    try {
      await onSortFinish(reorderedItems.map((item) => item.asset));
      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.reorderSuccess),
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

  return (
    <Stack direction="column" gap="400">
      <Stack direction="row" justify="flex-end" gap="200">
        <Button
          variant="outline"
          colorPalette="primary"
          isDisabled={!isDirty}
          onPress={() => setReorderedItems(toReorderItems(items))}
        >
          {intl.formatMessage(FormModalPage.Intl.revert)}
        </Button>
        <Button
          variant="solid"
          colorPalette="primary"
          isDisabled={!isDirty}
          onPress={save}
        >
          {intl.formatMessage(FormModalPage.Intl.save)}
        </Button>
      </Stack>
      <DraggableList.Root<TReorderItem>
        aria-label={intl.formatMessage(messages.listLabel)}
        items={reorderedItems}
        onUpdateItems={setReorderedItems}
      >
        {(item) => (
          <DraggableList.Item id={item.key} textValue={item.label}>
            <Stack direction="column" gap="100" py="200">
              <Text fontWeight="600">{item.label}</Text>
              {item.asset.key && (
                <Text textStyle="sm" color="neutral.11">
                  {intl.formatMessage(messages.key, { key: item.asset.key })}
                </Text>
              )}
              {item.asset.descriptionAllLocales && (
                <Text textStyle="sm" color="neutral.11">
                  {formatLocalizedField(item.asset.descriptionAllLocales)}
                </Text>
              )}
              {item.asset.sources.map((source) => (
                <Text
                  key={source.key ?? source.uri}
                  textStyle="sm"
                  color="neutral.11"
                  truncate
                >
                  {source.uri}
                </Text>
              ))}
            </Stack>
          </DraggableList.Item>
        )}
      </DraggableList.Root>
    </Stack>
  );
};

export default AssetsReorderList;
