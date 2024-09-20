import {
  ConfirmationDialog,
  useModalState,
} from '@commercetools-frontend/application-components';
import Spacings from '@commercetools-uikit/spacings';
import { FC, useCallback, useEffect } from 'react';
import Text from '@commercetools-uikit/text';
import messages from './messages';
import { useIntl } from 'react-intl';
import { TAsset } from '../../types/generated/ctp';
import { DOMAINS } from '@commercetools-frontend/constants';
import {
  useShowApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import transformErrors from '../assets-create/transform-errors';

type Props = {
  onClose: (...args: unknown[]) => unknown;
  selectedAssets: Array<TAsset>;
  onDelete: (assets: Array<TAsset>) => Promise<void>;
};

const AssetsDelete: FC<Props> = ({ onClose, selectedAssets, onDelete }) => {
  const intl = useIntl();
  const confirmationModalState = useModalState();
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();

  const handleClose = () => {
    confirmationModalState.closeModal();
    onClose();
  };

  const handleConfirm = useCallback(async () => {
    try {
      await onDelete(selectedAssets);

      showNotification({
        kind: 'success',
        domain: DOMAINS.SIDE,
        text: intl.formatMessage(messages.deleteSuccess),
      });
      await onClose();

      handleClose();
    } catch (graphQLErrors) {
      const transformedErrors = transformErrors(graphQLErrors);
      if (transformedErrors.unmappedErrors.length > 0) {
        showApiErrorNotification({
          errors:
            transformedErrors.unmappedErrors as TApiErrorNotificationOptions['errors'],
        });
      }
    }
  }, []);

  useEffect(() => {
    confirmationModalState.openModal();
    return handleClose;
  }, []);

  return (
    <ConfirmationDialog
      title="Confirm deletion"
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

export default AssetsDelete;
