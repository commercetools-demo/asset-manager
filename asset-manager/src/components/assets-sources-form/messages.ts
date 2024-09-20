import { defineMessages } from 'react-intl';

export default defineMessages({
  addEnumButtonLabel: {
    id: 'AssetSourceList.label',
    defaultMessage: 'Add New Source',
  },
  tableHeaderLabelKey: {
    id: 'AssetSourceList.key',
    description:
      'The column title of the enumeration key in the table displaying enums on the attributed-detail page in product-types administration',
    defaultMessage: 'Asset Key',
  },
  tableHeaderLabelUri: {
    id: 'AssetSourceList.uri',
    defaultMessage: 'Uri *',
  },
  tableHeaderLabelWidth: {
    id: 'AssetSourceList.width',
    defaultMessage: 'Width',
  },
  tableHeaderLabelHeight: {
    id: 'AssetSourceList.height',
    defaultMessage: 'Height',
  },
  tableHeaderLabelContentType: {
    id: 'AssetSourceList.contentType',
    defaultMessage: 'Content Type',
  },
  missingRequiredField: {
    id: 'AssetSourceList.form.errors.missingRequiredField',
    defaultMessage: 'This field is required. Provide a value.',
  },
});
