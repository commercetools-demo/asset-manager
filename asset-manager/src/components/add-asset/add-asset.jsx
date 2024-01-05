import React, { useEffect } from 'react';
import { Formik, useFormik } from 'formik';
import TextField from '@commercetools-uikit/text-field';
import TextInput from '@commercetools-uikit/text-input';
import {
  FormModalPage,
  useModalState,
} from '@commercetools-frontend/application-components';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import LocalizedTextField from '@commercetools-uikit/localized-text-field';
import { useIntl } from 'react-intl';
import messages from './messages';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import PropTypes from 'prop-types';
import { useAsset } from '../../hooks/use-assets-connector';

const createEmptyLocalizedString = (projectLanguages) => {
  const localizedStrings = {};
  projectLanguages.forEach((language) => {
    localizedStrings[language] = '';
  });
  return localizedStrings;
};
const AddAsset = ({ onClose, productId, variantId }) => {
  const intl = useIntl();
  const { addAsset, version } = useAsset({ productId, variantId });
  const dataLocale = useApplicationContext((context) => context.dataLocale);
  const projectLanguages = useApplicationContext(
    (context) => context.project?.languages
  );

  const formModalState = useModalState();
  const formik = useFormik({
    initialValues: {
      name: createEmptyLocalizedString(projectLanguages),
      description: createEmptyLocalizedString(projectLanguages),
      url: '',
    },
    validate: (formikValues) => {
      if (LocalizedTextInput.isEmpty(formikValues.name)) {
        return { name: { missing: true } };
      }
      if (TextInput.isEmpty(formikValues.url)) {
        return { url: { missing: true } };
      }
      return {};
    },
    onSubmit: async (formikValues) => {
      await addAsset(
        {
          name: Object.keys(formikValues.name).map((key) => ({
            locale: key,
            value: formikValues.name[key],
          })),
          description: Object.keys(formikValues.description).map((key) => ({
            locale: key,
            value: formikValues.description[key],
          })),
          uri: formikValues.url,
        },
        version
      );
      handleClose();
    },
  });

  const handleClose = () => {
    formModalState.closeModal();
    onClose();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const a = await formik.validateForm();
    if (!a?.name?.missing && !a?.url?.missing) {
      formik.submitForm();
    }
  };

  useEffect(() => {
    formModalState.openModal();
    return handleClose;
  }, []);

  return (
    <Formik initialValues={formik.initialValues}>
      <FormModalPage
        title={intl.formatMessage(messages.title)}
        isOpen={formModalState.isModalOpen}
        onClose={handleClose}
        isPrimaryButtonDisabled={formik.isSubmitting}
        onSecondaryButtonClick={formik.handleReset}
        onPrimaryButtonClick={handleSubmit}
        level={2}
        baseZIndex={10}
      >
        <form onSubmit={handleSubmit}>
          <LocalizedTextField
            name="name"
            title={intl.formatMessage(messages.name)}
            value={formik.values.name}
            selectedLanguage={dataLocale}
            errors={formik.errors.name}
            touched={formik.touched.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            isRequired
          />
          <LocalizedTextField
            name="description"
            title={intl.formatMessage(messages.description)}
            value={formik.values.description}
            selectedLanguage={dataLocale}
            errors={formik.errors.description}
            touched={formik.touched.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <TextField
            name="url"
            title={intl.formatMessage(messages.url)}
            isRequired={true}
            value={formik.values.url}
            errors={formik.errors.url}
            touched={formik.touched.url}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.url &&
            formik.errors.url &&
            formik.errors.url.missing && <div>A name is required</div>}
        </form>
      </FormModalPage>
    </Formik>
  );
};

AddAsset.propTypes = {
  onClose: PropTypes.func.isRequired,
  productId: PropTypes.string.isRequired,
  variantId: PropTypes.string.isRequired,
};

export default AddAsset;
