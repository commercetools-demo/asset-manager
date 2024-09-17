import { FC, ReactElement } from 'react';
import { FormikProvider, useFormik } from 'formik';
import omitEmpty from 'omit-empty-es';
import { FormikConfig } from 'formik/dist/types';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import TextField from '@commercetools-uikit/text-field';
import { useIntl } from 'react-intl';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import TextInput from '@commercetools-uikit/text-input';
import Spacings from '@commercetools-uikit/spacings';
import messages from './messages';
type Formik = ReturnType<typeof useFormik>;

export type TFormValues = {
  name: Record<string, string>;
  description: Record<string, string>;
  url: string;
};

type TErrors = {
  name: { missing?: boolean };
  url: { missing?: boolean };
};

const validate = (formikValues: TFormValues) => {
  const errors: TErrors = {
    name: {},
    url: {},
  };

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
        <LocalizedTextField
          name="name"
          title={intl.formatMessage(messages.name)}
          value={formik.values.name || ''}
          selectedLanguage={dataLocale}
          isRequired
          errors={
            LocalizedTextField.toFieldErrors<TFormValues>(formik.errors).name
          }
          touched={!!formik.touched.name}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
        />
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
  });
};

export default AssetForm;
