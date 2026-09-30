import {
  Box,
  Button,
  DataTable,
  FieldErrors,
  IconButton,
  NumberInput,
  Text,
  TextInput,
  type DataTableColumnItem,
} from '@commercetools/nimbus';
import { Add, Delete } from '@commercetools/nimbus-icons';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import { FC } from 'react';
import { useFormik } from 'formik';
import {
  AssetSource,
  TFormValues,
  TSourceError,
} from '../asset-form/asset-form';
import { useCmsAuth } from '../../contexts/cms-auth-context';
import { AddNewSourceWithPuckImagePicker } from '../add-new-source-with-puck-image-picker';

type RowItem = { id: string; index: number } & AssetSource;

const emptyRow: AssetSource = {
  key: undefined,
  uri: '',
  contentType: undefined,
  width: undefined,
  height: undefined,
};

export type OnChangeValue = (
  field: string,
  nextValue: string | number | undefined,
  absoluteIndex: number
) => void;

type Props = {
  onAddEnumValue: (item: AssetSource) => void;
  onRemoveValue: (absoluteIndex: number) => void;
  onChangeValue: OnChangeValue;
  formik: ReturnType<typeof useFormik<TFormValues>>;
  isDisabled?: boolean;
};

const renderError = (key: string) =>
  key === 'missing' ? (
    <FormattedMessage {...messages.missingRequiredField} />
  ) : null;

export const AssetsSourcesForm: FC<Props> = ({
  formik,
  onAddEnumValue,
  onRemoveValue,
  onChangeValue,
  isDisabled,
}) => {
  const intl = useIntl();
  const { jwtToken } = useCmsAuth();

  const items: Array<AssetSource> = formik.values.sources ?? [];

  const rows: Array<RowItem> = items.map((item, index) => ({
    ...item,
    id: index.toString(),
    index,
  }));

  const getError = (row: RowItem, field: keyof TSourceError) => {
    const error = formik.errors.sources?.[row.index] as
      | TSourceError
      | undefined;
    return error?.[field];
  };

  const renderTextInput = (
    row: RowItem,
    field: 'uri' | 'key' | 'contentType',
    label: string
  ) => {
    const error = getError(row, field);
    return (
      <>
        <TextInput
          aria-label={label}
          value={row[field] || ''}
          name={`sources.${row.index}.${field}`}
          onChange={(value) => onChangeValue(field, value, row.index)}
          isDisabled={isDisabled}
          isInvalid={error !== undefined}
        />
        <FieldErrors errors={error} renderError={renderError} />
      </>
    );
  };

  const renderNumberInput = (
    row: RowItem,
    field: 'width' | 'height',
    label: string
  ) => {
    const error = getError(row, field);
    return (
      <>
        <NumberInput
          aria-label={label}
          value={row[field] ?? NaN}
          name={`sources.${row.index}.${field}`}
          onChange={(value) =>
            onChangeValue(
              field,
              Number.isNaN(value) ? undefined : value,
              row.index
            )
          }
          isDisabled={isDisabled}
          isInvalid={error !== undefined}
        />
        <FieldErrors errors={error} renderError={renderError} />
      </>
    );
  };

  const keyLabel = intl.formatMessage(messages.tableHeaderLabelKey);
  const uriLabel = intl.formatMessage(messages.tableHeaderLabelUri);
  const widthLabel = intl.formatMessage(messages.tableHeaderLabelWidth);
  const heightLabel = intl.formatMessage(messages.tableHeaderLabelHeight);
  const contentTypeLabel = intl.formatMessage(
    messages.tableHeaderLabelContentType
  );

  const columns: Array<DataTableColumnItem<RowItem>> = [
    {
      id: 'key',
      header: keyLabel,
      accessor: (row) => renderTextInput(row, 'key', keyLabel),
    },
    {
      id: 'uri',
      header: uriLabel,
      accessor: (row) =>
        jwtToken ? (
          <Text truncate title={row.uri || ''}>
            {row.uri || ''}
          </Text>
        ) : (
          renderTextInput(row, 'uri', uriLabel)
        ),
    },
    {
      id: 'width',
      header: widthLabel,
      accessor: (row) => renderNumberInput(row, 'width', widthLabel),
    },
    {
      id: 'height',
      header: heightLabel,
      accessor: (row) => renderNumberInput(row, 'height', heightLabel),
    },
    {
      id: 'contentType',
      header: contentTypeLabel,
      accessor: (row) => renderTextInput(row, 'contentType', contentTypeLabel),
    },
    {
      id: 'delete',
      header: '',
      accessor: (row) => (
        <IconButton
          aria-label="Delete List Item"
          variant="ghost"
          colorPalette="primary"
          size="xs"
          isDisabled={isDisabled || items.length === 1}
          onPress={() => onRemoveValue(row.index)}
        >
          <Delete />
        </IconButton>
      ),
    },
  ];

  const footer = jwtToken ? (
    <AddNewSourceWithPuckImagePicker
      isDisabled={isDisabled}
      onConfirm={(uri) => onAddEnumValue({ ...emptyRow, uri })}
    />
  ) : (
    <Button
      variant="outline"
      colorPalette="primary"
      onPress={() => onAddEnumValue(emptyRow)}
      isDisabled={isDisabled}
    >
      <Add />
      {intl.formatMessage(messages.addEnumButtonLabel)}
    </Button>
  );

  return (
    <Box width="100%">
      <DataTable columns={columns} rows={rows} footer={footer} />
    </Box>
  );
};

export default AssetsSourcesForm;
