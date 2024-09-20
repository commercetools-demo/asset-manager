import Constraints from '@commercetools-uikit/constraints';
import DataTable, { TRow } from '@commercetools-uikit/data-table';
import Spacings from '@commercetools-uikit/spacings';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { BinLinearIcon, PlusBoldIcon } from '@commercetools-uikit/icons';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import IconButton from '@commercetools-uikit/icon-button';
import { FC, Fragment } from 'react';
import TextInput from '@commercetools-uikit/text-input';
import { useFormik } from 'formik';

import { ErrorMessage } from '@commercetools-uikit/messages';
import {
  AssetSource,
  TFormValues,
  TSourceError,
} from '../asset-form/asset-form';
import { columnDefinitions } from './utils';
import NumberInput from '@commercetools-uikit/number-input';
import { TColumn } from '@commercetools-uikit/data-table/dist/declarations/src/data-table';

type RowItem = { index: number; absoluteIndex?: number } & TRow & AssetSource;

const emptyRow: AssetSource = {
  key: undefined,
  uri: '',
  contentType: undefined,
  width: undefined,
  height: undefined,
};

export type OnChangeValue = (
  field: string,
  nextValue: string | number,
  absoluteIndex: number
) => void;

type Props = {
  onAddEnumValue: (item: AssetSource) => void;
  onRemoveValue: (absoluteIndex: number) => void;
  onChangeValue: OnChangeValue;
  formik: ReturnType<typeof useFormik<TFormValues>>;
  isDisabled?: boolean;
};

export const AssetsSourcesForm: FC<Props> = ({
  formik,
  onAddEnumValue,
  onRemoveValue,
  onChangeValue,
  isDisabled,
}) => {
  const intl = useIntl();

  const renderErrors = (keys: Array<string>) => {
    return keys.map((key) => {
      switch (key) {
        case 'missing':
          return <FormattedMessage {...messages.missingRequiredField} />;
        default:
          return null;
      }
    });
  };

  const handleAddEnumClick = () => {
    onAddEnumValue(emptyRow);
  };

  const items: Array<AssetSource> =
    !formik.values.sources || formik.values.sources.length === 0
      ? [emptyRow]
      : formik.values.sources;

  const rows = items.map(
    (item, index): RowItem => ({
      ...item,
      id: index.toString(),
      absoluteIndex: index,
      index,
    })
  );

  const itemRenderer = (row: RowItem, column: TColumn<RowItem>) => {
    const nameAttribute = `sources.${row.index}.${column.key}`;

    const error = formik.errors.sources?.[row.index] as
      | TSourceError
      | undefined;

    switch (column.key) {
      case 'delete':
        return (
          <IconButton
            icon={<BinLinearIcon />}
            isDisabled={isDisabled || items.length === 1}
            label="Delete List Item"
            size="30"
            onClick={() => onRemoveValue(row.absoluteIndex || 0)}
          />
        );
      case 'width':
      case 'height': {
        return (
          <Fragment>
            <NumberInput
              value={row[column.key] || ''}
              name={nameAttribute}
              onChange={(event) => {
                onChangeValue(
                  column.key,
                  Number.parseInt(event.target.value, 10),
                  row.absoluteIndex || 0
                );
              }}
              hasError={error?.[column.key] !== undefined}
              isDisabled={isDisabled}
            />
            {error?.[column.key] !== undefined && (
              <ErrorMessage>
                {renderErrors(Object.keys(error?.[column.key]))}
              </ErrorMessage>
            )}
          </Fragment>
        );
      }
      case 'contentType':
      case 'key':
      case 'uri':
        return (
          <Fragment>
            <TextInput
              value={row[column.key] || ''}
              name={nameAttribute}
              onChange={(event) => {
                onChangeValue(
                  column.key,
                  event.target.value,
                  row.absoluteIndex || 0
                );
              }}
              isDisabled={isDisabled}
              hasError={error?.[column.key] !== undefined}
            />
            {error?.[column.key] !== undefined && (
              <ErrorMessage>
                {renderErrors(Object.keys(error?.[column.key]))}
              </ErrorMessage>
            )}
          </Fragment>
        );
      default:
        console.log('Should not happen');
        return '';
    }
  };

  return (
    <Spacings.Stack scale="m">
      <Constraints.Horizontal max="scale">
        <DataTable
          columns={columnDefinitions}
          rows={rows}
          itemRenderer={itemRenderer}
          footer={
            <SecondaryButton
              iconLeft={<PlusBoldIcon />}
              label={intl.formatMessage(messages.addEnumButtonLabel)}
              onClick={handleAddEnumClick}
              isDisabled={isDisabled}
            />
          }
        ></DataTable>
      </Constraints.Horizontal>
    </Spacings.Stack>
  );
};

export default AssetsSourcesForm;
