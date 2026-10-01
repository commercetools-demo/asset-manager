import {
  Button,
  Grid,
  Text,
  FieldErrors,
  IconButton,
  NumberInput,
  TextInput,
  Stack,
  Flex,
} from '@commercetools/nimbus';
import { Add, Delete } from '@commercetools/nimbus-icons';
import { FormattedMessage, useIntl } from 'react-intl';
import messages from './messages';
import { FC, Fragment } from 'react';
import { useFormikContext } from 'formik';
import {
  AssetSource,
  TFormValues,
  TSourceError,
} from '../asset-form/asset-form';

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
  isDisabled?: boolean;
};

const renderError = (key: string) =>
  key === 'missing' ? (
    <FormattedMessage {...messages.missingRequiredField} />
  ) : null;

export const AssetsSourcesForm: FC<Props> = ({
  onAddEnumValue,
  onRemoveValue,
  onChangeValue,
  isDisabled,
}) => {
  const intl = useIntl();
  const formik = useFormikContext<TFormValues>();

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
          width="full"
          minWidth="0"
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
          width="full"
          minWidth="0"
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

  const headers = [
    keyLabel,
    uriLabel,
    widthLabel,
    heightLabel,
    contentTypeLabel,
    '',
  ];

  return (
    <Stack direction="column" gap="400">
      <Flex justifyContent="flex-end">
        <Button
          variant="outline"
          colorPalette="primary"
          isDisabled={isDisabled}
          onPress={() => onAddEnumValue(emptyRow)}
        >
          <Add />
          {intl.formatMessage(messages.addEnumButtonLabel)}
        </Button>
      </Flex>
      <Grid
        templateColumns="minmax(0, 2fr) minmax(0, 3fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr) auto"
        columnGap="200"
        rowGap="300"
        alignItems="start"
      >
        {headers.map((header, index) => (
          <Grid.Item key={index}>
            <Text fontWeight="600" textStyle="sm" color="neutral.11">
              {header}
            </Text>
          </Grid.Item>
        ))}
        {rows.map((row) => (
          <Fragment key={row.id}>
            <Grid.Item>{renderTextInput(row, 'key', keyLabel)}</Grid.Item>
            <Grid.Item>{renderTextInput(row, 'uri', uriLabel)}</Grid.Item>
            <Grid.Item>{renderNumberInput(row, 'width', widthLabel)}</Grid.Item>
            <Grid.Item>
              {renderNumberInput(row, 'height', heightLabel)}
            </Grid.Item>
            <Grid.Item>
              {renderTextInput(row, 'contentType', contentTypeLabel)}
            </Grid.Item>
            <Grid.Item>
              <IconButton
                aria-label={intl.formatMessage(messages.deleteSource)}
                variant="ghost"
                colorPalette="primary"
                size="xs"
                isDisabled={isDisabled || items.length === 1}
                onPress={() => onRemoveValue(row.index)}
              >
                <Delete />
              </IconButton>
            </Grid.Item>
          </Fragment>
        ))}
      </Grid>
    </Stack>
  );
};

export default AssetsSourcesForm;
