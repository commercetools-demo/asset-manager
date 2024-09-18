import { FC, ReactElement } from 'react';
import { FormikProvider, useFormik } from 'formik';
import omitEmpty from 'omit-empty-es';
import { FormikConfig } from 'formik/dist/types';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import TextField from '@commercetools-uikit/text-field';
import { FormattedMessage, useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import TextInput from '@commercetools-uikit/text-input';
import Spacings from '@commercetools-uikit/spacings';
import messages from './messages';
import Grid from '@commercetools-uikit/grid';
import { designTokens } from '@commercetools-uikit/design-system';
import Card from '@commercetools-uikit/card';
type Formik = ReturnType<typeof useFormik>;

export type TFormValues = {
  name: Record<string, string>;
  description: Record<string, string>;
  url: string;
  key: string;
};

type TErrors = {
  name: { missing?: boolean };
  url: { missing?: boolean };
  key: { invalidInput?: boolean };
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
    url: {},
    key: {},
  };

  if (formikValues.key && formikValues.key.length > 0) {
    const keyValue = formikValues.key.trim();
    const keyLength = keyValue.length;
    if (keyLength < 2 || keyLength > 256 || !/^[a-zA-Z0-9-_]+$/.test(keyValue))
      errors.key.invalidInput = true;
  }

  if (LocalizedTextInput.isEmpty(formikValues.name)) {
    errors.name.missing = true;
  }
  if (!formikValues.url || TextInput.isEmpty(formikValues.url)) {
    errors.url.missing = true;
  }

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
  children: (formProps: FormProps) => JSX.Element;
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

  const formElements = (
    <FormikProvider value={formik}>
      <Spacings.Stack scale="m">
        <Grid
          gridTemplateColumns={`repeat(2, ${designTokens.constraint11})`}
          gridGap={designTokens.spacingM}
        >
          <Grid.Item>
            <Card type="flat" insetScale="s">
              <LocalizedTextField
                name="name"
                title={intl.formatMessage(messages.name)}
                value={formik.values.name || ''}
                selectedLanguage={dataLocale}
                isRequired
                errors={
                  LocalizedTextField.toFieldErrors<TFormValues>(formik.errors)
                    .name
                }
                touched={!!formik.touched.name}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
              />
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card type="flat" insetScale="s">
              <LocalizedTextField
                name="description"
                title={intl.formatMessage(messages.description)}
                value={formik.values.description}
                selectedLanguage={dataLocale}
                errors={
                  LocalizedTextField.toFieldErrors<TFormValues>(formik.errors)
                    .description
                }
                touched={!!formik.touched.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            </Card>
          </Grid.Item>
          <Grid.Item>
            <Card type="flat" insetScale="s">
              <TextField
                name="key"
                value={formik.values.key || ''}
                title={intl.formatMessage(messages.keyTitle)}
                hint={intl.formatMessage(messages.keyHint)}
                errors={TextField.toFieldErrors<TFormValues>(formik.errors).key}
                touched={!!formik.touched.key}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                renderError={renderKeyInputErrors}
              />
            </Card>
          </Grid.Item>
          <TextField
            name="url"
            title={intl.formatMessage(messages.url)}
            isRequired={true}
            value={formik.values.url}
            errors={TextField.toFieldErrors<TFormValues>(formik.errors).url}
            touched={formik.touched.url}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>
      </Spacings.Stack>
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
