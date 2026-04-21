import { type SyntheticEvent, useState } from 'react';
import {
  FormModalPage,
  useModalState,
} from '@commercetools-frontend/application-components';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import { PlusBoldIcon } from '@commercetools-uikit/icons';
import {
  ImagePickerField,
  ImagePickerProvider,
} from '@commercetools-demo/puck-image-picker';
import { useCmsAuth } from '../../contexts/cms-auth-context';

type Props = {
  onConfirm: (uri: string) => void;
  isDisabled?: boolean;
};

export const AddNewSourceWithPuckImagePicker = ({
  onConfirm,
  isDisabled,
}: Props) => {
  const { isModalOpen, openModal, closeModal } = useModalState();
  const [pickedUrl, setPickedUrl] = useState('');

  const { jwtToken } = useCmsAuth();
  const { environment, project } = useApplicationContext((ctx) => ({
    environment: ctx.environment as { CMS_API_URL?: string },
    project: ctx.project,
  }));

  const handlePrimaryClick = (_event: SyntheticEvent) => {
    onConfirm(pickedUrl);
    setPickedUrl('');
    closeModal();
  };

  const handleClose = (_event: SyntheticEvent) => {
    setPickedUrl('');
    closeModal();
  };

  return (
    <>
      <SecondaryButton
        iconLeft={<PlusBoldIcon />}
        label="Add new source"
        onClick={openModal}
        isDisabled={isDisabled}
      />

      <FormModalPage
        title="Add new source"
        isOpen={isModalOpen}
        onClose={handleClose}
        onPrimaryButtonClick={handlePrimaryClick}
        onSecondaryButtonClick={handleClose}
        labelPrimaryButton={FormModalPage.Intl.add}
        labelSecondaryButton={FormModalPage.Intl.cancel}
        isPrimaryButtonDisabled={!pickedUrl}
      >
        <ImagePickerProvider
          baseURL={environment?.CMS_API_URL ?? ''}
          projectKey={project?.key ?? ''}
          businessUnitKey="products"
          jwtToken={jwtToken ?? undefined}
        >
          <ImagePickerField
            value={pickedUrl}
            onChange={setPickedUrl}
            imagesOnly={false}
          />
        </ImagePickerProvider>
      </FormModalPage>
    </>
  );
};

export default AddNewSourceWithPuckImagePicker;
