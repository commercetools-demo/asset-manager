import { SortableElement } from 'react-sortable-hoc';
import { TAsset } from '../../types/generated/ctp';
import Card from '@commercetools-uikit/card';
import { FC } from 'react';
import {
  formatLocalizedString,
  transformLocalizedFieldToLocalizedString,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import messages from './messages';

type Props = {
  value: TAsset;
};

const AssetsSortGridItem: FC<Props> = ({ value }) => {
  const { dataLocale, languages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
    languages: context.project?.languages ?? [],
  }));

  return (
    <Card theme="light" type="raised">
      <Spacings.Inline
        scale={'m'}
        alignItems={'stretch'}
        justifyContent={'space-between'}
      >
        <Spacings.Stack alignItems="flex-start">
          {value.nameAllLocales && (
            <Text.Body
              intlMessage={{
                ...messages.name,
                values: {
                  key: formatLocalizedString(
                    {
                      name: transformLocalizedFieldToLocalizedString(
                        value.nameAllLocales ?? []
                      ),
                    },
                    {
                      key: 'name',
                      locale: dataLocale,
                      fallbackOrder: languages,
                    }
                  ),
                },
              }}
              tone="secondary"
            />
          )}
          {value.key && (
            <Text.Detail
              intlMessage={{
                ...messages.key,
                values: {
                  key: value?.key,
                },
              }}
              tone="secondary"
            />
          )}
          {value.descriptionAllLocales && (
            <Text.Detail
              intlMessage={{
                ...messages.description,
                values: {
                  key: formatLocalizedString(
                    {
                      name: transformLocalizedFieldToLocalizedString(
                        value.descriptionAllLocales ?? []
                      ),
                    },
                    {
                      key: 'name',
                      locale: dataLocale,
                      fallbackOrder: languages,
                    }
                  ),
                },
              }}
              tone="secondary"
            />
          )}
        </Spacings.Stack>
        <Spacings.Stack alignItems="flex-start">
          {value.sources.map((source) => {
            return <div>URI: {source.uri}</div>;
          })}
        </Spacings.Stack>
      </Spacings.Inline>
    </Card>
  );
};

export default SortableElement(AssetsSortGridItem);
