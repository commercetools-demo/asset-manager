import { FormattedMessage } from 'react-intl';
import messages from './messages';

export const columnDefinitions = [
  // key column
  {
    key: 'key',
    label: <FormattedMessage {...messages.tableHeaderLabelKey} />,
    isSortable: false,
  },
  {
    key: 'uri',
    label: <FormattedMessage {...messages.tableHeaderLabelUri} />,
    isSortable: false,
  },
  {
    key: 'width',
    label: <FormattedMessage {...messages.tableHeaderLabelWidth} />,
    isSortable: false,
  },
  {
    key: 'height',
    label: <FormattedMessage {...messages.tableHeaderLabelHeight} />,
    isSortable: false,
  },
  {
    key: 'contentType',
    label: <FormattedMessage {...messages.tableHeaderLabelContentType} />,
    isSortable: false,
  },
  // delete column
  {
    key: 'delete',
    width: 'max-content',
    label: '',
  },
];
