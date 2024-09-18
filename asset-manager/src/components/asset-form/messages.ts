import { defineMessages } from 'react-intl';

export default defineMessages({
  url: {
    id: 'AddAsset.url',
    defaultMessage: 'URL',
  },
  description: {
    id: 'AddAsset.description',
    defaultMessage: 'Description',
  },
  name: {
    id: 'AddAsset.name',
    defaultMessage: 'Name',
  },
  keyTitle: {
    id: 'AddAsset.form.key.title',
    description: 'Title for key field',
    defaultMessage: 'Key',
  },
  keyHint: {
    id: 'AddAsset.form.key.hint',
    description: 'Hint for key field',
    defaultMessage:
      'May only contain between 2 and 256 alphanumeric characters, underscores, or hyphens (no spaces or special characters like ñ, ü, #, %).',
  },
  duplicateKey: {
    id: 'AddAsset.form.GeneralInfoForm.duplicateKey',
    defaultMessage: 'An asset with this key already exists.',
  },
  requiredKey: {
    id: 'AddAsset.form.GeneralInfoForm.requiredKey',
    defaultMessage: 'This field is required. Provide at least one value.',
  },
  invalidKey: {
    id: 'AddAsset.form.GeneralInfoForm.invalidKey',
    defaultMessage:
      'Key must contain between 2 and 256 alphanumeric characters, underscores and/or hyphens',
  },
});
