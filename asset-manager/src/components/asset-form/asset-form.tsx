import { FC, ReactElement } from 'react';
import { FormikProvider, useFormik } from 'formik';
import omitEmpty from 'omit-empty-es';
import { FormikConfig } from 'formik/dist/types';
import { FormattedMessage, useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  LocalizedField,
  PageContent,
  Stack,
  TextInputField,
} from '@commercetools/nimbus';
import messages from './messages';
import AssetsSourcesForm, {
  OnChangeValue,
} from '../assets-sources-form/assets-sources-form';
type Formik = ReturnType<typeof useFormik>;

export type AssetSource = {
  key?: string;
  uri?: string;
  width?: number;
  height?: number;
  contentType?: string;
};

export type TFormValues = {
  name: Record<string, string>;
  description: Record<string, string>;
  key: string;
  sources?: Array<AssetSource> | undefined;
};

export type TSourceError = {
  key: { missing?: boolean };
  uri: { missing?: boolean };
  width: { missing?: boolean };
  height: { missing?: boolean };
  contentType: { missing?: boolean };
};

export type TSourceErrors = { [key: number]: TSourceError };

type TErrors = {
  name: { missing?: boolean };
  description?: Record<string, boolean>;
  key: { invalidInput?: boolean };
  sources: TSourceErrors;
};

const renderKeyInputErrors = (key: string) => {
  switch (key) {
    case 'invalidInput':
      return <FormattedMessage {...messages.invalidKey} />;
    case 'duplicate':
      return <FormattedMessage {...messages.duplicateKey} />;
    case 'missing':
      return <FormattedMessage {...messages.requiredKey} />;
    default:
      return null;
  }
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    name: {},
    key: {},
    sources: {},
  };

  if (formikValues.key && formikValues.key.length > 0) {
    const keyValue = formikValues.key.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      errors.key.invalidInput = true;
  }

  if (LocalizedField.isEmpty(formikValues.name)) {
    errors.name.missing = true;
  }

  formikValues.sources?.forEach((item, index) => {
    const sourceError: TSourceError = {
      uri: {},
      width: {},
      height: {},
      key: {},
      contentType: {},
    };
    if (!item.uri || item.uri.trim().length === 0) {
      sourceError.uri.missing = true;
    }
    if (item.width && !item.height) {
      sourceError.height.missing = true;
    }
    if (!item.width && item.height) {
      sourceError.width.missing = true;
    }
    if (Object.keys(sourceError).length !== 0) {
      errors.sources[index] = sourceError;
    }
  });

  return omitEmpty<TErrors>(errors);
};

type FormProps = {
  formElements: ReactElement;
  values: Formik['values'];
  isDirty: Formik['dirty'];
  isSubmitting: Formik['isSubmitting'];
  submitForm: Formik['handleSubmit'];
  handleReset: Formik['handleReset'];
  isValid: Formik['isValid'];
};

type Props = {
  onSubmit: FormikConfig<TFormValues>['onSubmit'];
  initialValues: TFormValues;
  children: (formProps: FormProps) => ReactElement;
};

export const AssetForm: FC<Props> = ({ initialValues, onSubmit, children }) => {
  const intl = useIntl();
  const { dataLocale } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale ?? '',
  }));
  const formik = useFormik<TFormValues>({
    initialValues: initialValues,
    onSubmit: onSubmit,
    validate,
    enableReinitialize: true,
  });

  const handleAddEnumValue = (enumTemplate: AssetSource) => {
    const enumDraftItemIndexes = formik.values.sources?.length || 0;
    formik.setFieldValue(`sources.${enumDraftItemIndexes}`, enumTemplate);
  };

  const handleRemoveEnumValue = (absoluteIndex: number) => {
    if (formik.values.sources && formik.values.sources[absoluteIndex]) {
      const newArray = [...formik.values.sources];
      newArray.splice(absoluteIndex, 1);
      formik.setFieldValue('sources', newArray, false);
    }
  };

  const handleChangeEnumValue: OnChangeValue = (
    field,
    nextValue,
    absoluteIndex
  ) => {
    // if this is the first change, create the draft within the changes
    if (!formik.values.sources || !formik.values.sources[absoluteIndex]) {
      formik.setFieldValue(`sources.${absoluteIndex}`, {
        key: '',
        label: undefined,
      });
    }
    // `field` can be `key` or `label` (or `label.de` depending on the attribute being localized or not)
    formik.setFieldValue(`sources.${absoluteIndex}.${field}`, nextValue, false);
    formik.setFieldTouched(`sources.${absoluteIndex}.${field}`, true);
  };

  const errors = formik.errors as unknown as Partial<TErrors>;

  const formElements = (
    <FormikProvider value={formik}>
      <Stack direction="column" gap="400">
        <PageContent.Root columns={'1/1'}>
          <PageContent.Column>
            <LocalizedField
              name="name"
              label={intl.formatMessage(messages.name)}
              valuesByLocaleOrCurrency={formik.values.name || {}}
              defaultLocaleOrCurrency={dataLocale}
              isRequired
              errors={errors.name}
              touched={!!formik.touched.name}
              onBlur={() => formik.setFieldTouched('name', true)}
              onChange={(event) =>
                formik.setFieldValue(
                  `name.${event.target.locale}`,
                  event.target.value
                )
              }
              width={'full'}
            />
            <TextInputField
              name="key"
              value={formik.values.key || ''}
              label={intl.formatMessage(messages.keyTitle)}
              description={intl.formatMessage(messages.keyHint)}
              errors={errors.key}
              touched={!!formik.touched.key}
              onBlur={() => formik.setFieldTouched('key', true)}
              onChange={(value) => formik.setFieldValue('key', value)}
              renderError={renderKeyInputErrors}
              width={'full'}
            />
          </PageContent.Column>
          <PageContent.Column>
            <LocalizedField
              name="description"
              label={intl.formatMessage(messages.description)}
              valuesByLocaleOrCurrency={formik.values.description}
              defaultLocaleOrCurrency={dataLocale}
              errors={errors.description}
              touched={!!formik.touched.description}
              onBlur={() => formik.setFieldTouched('description', true)}
              onChange={(event) =>
                formik.setFieldValue(
                  `description.${event.target.locale}`,
                  event.target.value
                )
              }
              width={'full'}
            />
          </PageContent.Column>
        </PageContent.Root>
        <PageContent.Root>
          <AssetsSourcesForm
            onAddEnumValue={handleAddEnumValue}
            onChangeValue={handleChangeEnumValue}
            onRemoveValue={handleRemoveEnumValue}
          />
        </PageContent.Root>
      </Stack>
    </FormikProvider>
  );
  return children({
    formElements,
    values: formik.values,
    isDirty: formik.dirty,
    isSubmitting: formik.isSubmitting,
    submitForm: formik.handleSubmit,
    handleReset: formik.handleReset,
    isValid: formik.isValid,
  });
};

export default AssetForm;
