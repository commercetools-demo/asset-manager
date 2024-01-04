import {
  ConfirmationDialog,
  useModalState,
} from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import { useCallback, useEffect } from 'react';
import Text from '@commercetools-uikit/text';
import PropTypes from 'prop-types';
import messages from './messages';
import { useIntl } from 'react-intl';
import { useAsset } from '../../hooks/use-assets-connector';

const DeleteAsset = ({ onClose, productId, variantId, selectedAssets }) => {
  const intl = useIntl();
  const confirmationModalState = useModalState();
  const { removeAssets, version } = useAsset({ productId, variantId });

  console.log(selectedAssets);
  const handleConfirm = useCallback(async () => {
    await removeAssets(selectedAssets.map((asset) => asset.id), version);
    handleClose();
  }, []);

  const handleClose = () => {
    confirmationModalState.closeModal();
    onClose();
  };

  useEffect(() => {
    confirmationModalState.openModal();
    return handleClose;
  }, []);

  return (
    <ConfirmationDialog
      title="Confirm channel deletion"
      isOpen={confirmationModalState.isModalOpen}
      onClose={confirmationModalState.closeModal}
      onCancel={confirmationModalState.closeModal}
      onConfirm={handleConfirm}
    >
      <Spacings.Stack scale="m">
        <Text.Body>
          {intl.formatMessage(messages.title, {
            number: selectedAssets.length,
          })}
        </Text.Body>
      </Spacings.Stack>
    </ConfirmationDialog>
  );
};

DeleteAsset.propTypes = {
  onClose: PropTypes.func.isRequired,
  selectedAssets: PropTypes.array.isRequired,
  productId: PropTypes.string.isRequired,
  variantId: PropTypes.string.isRequired,
};

export default DeleteAsset;
