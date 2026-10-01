import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'DeleteAsset.title',
    defaultMessage:
      '{number, plural, one {You are about to delete # asset.} other {You are about to delete # assets.}}',
  },
  confirmTitle: {
    id: 'DeleteAsset.confirmTitle',
    defaultMessage: 'Confirm deletion',
  },
  deleteSuccess: {
    id: 'DeleteAsset.form.message.delete.success',
    defaultMessage:
      '{number, plural, one {The asset has been deleted.} other {The assets have been deleted.}}',
  },
});
