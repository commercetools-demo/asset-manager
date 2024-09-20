import { FC, useCallback } from 'react';
import { FormModalPage } from '@commercetools-frontend/application-components';
import { useIntl } from 'react-intl';
import messages from './messages';
import {
  showApiErrorNotification,
  TApiErrorNotificationOptions,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import AssetForm, { TFormValues } from '../asset-form/asset-form';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import {
  transformLocalizedFieldToLocalizedString,
  transformLocalizedStringToLocalizedField,
} from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import transformErrors from './transform-errors';
import { TAssetDraftInput } from '../../types/generated/ctp';

type Props = {
  onClose: () => Promise<void>;
  onCreate: (draft: TAssetDraftInput) => Promise<void>;
};

export const AssetsCreate: FC<Props> = ({ onClose, onCreate }) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const showNotification = useShowNotification();

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      try {
        const draft: TAssetDraftInput = {
          key:
            formikValues.key && formikValues.key.length > 0
              ? formikValues.key
              : undefined,
          name: transformLocalizedStringToLocalizedField(
            LocalizedTextInput.omitEmptyTranslations(formikValues.name)
          ),
          description: transformLocalizedStringToLocalizedField(
            LocalizedTextInput.omitEmptyTranslations(formikValues.description)
          ),
          sources: formikValues.sources?.map((source) => {
            return {
              uri: source.uri || '',
              key: source.key && source.key.length > 0 ? source.key : undefined,
              contentType:
                source.contentType && source.contentType.length > 0
                  ? source.contentType
                  : undefined,
              dimensions:
                source.width && source.height
                  ? {
                      width: source.width,
                      height: source.height,
                    }
                  : undefined,
            };
          }),
        };

        await onCreate(draft);

        showNotification({
          kind: 'success',
          domain: DOMAINS.SIDE,
          text: intl.formatMessage(messages.createSuccess),
        });
        await onClose();
      } catch (graphQLErrors) {
        const transformedErrors = transformErrors(graphQLErrors);
        if (transformedErrors.unmappedErrors.length > 0) {
          showApiErrorNotification({
            errors:
              transformedErrors.unmappedErrors as TApiErrorNotificationOptions['errors'],
          });
        }

        formikHelpers.setErrors(transformedErrors.formErrors);
      }
    },
    [intl]
  );
  return (
    <AssetForm
      onSubmit={handleSubmit}
      initialValues={{
        key: '',
        name: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString([]) ?? {}
        ),
        description: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString([]) ?? {}
        ),
      }}
    >
      {(formProps) => {
        return (
          <FormModalPage
            title={intl.formatMessage(messages.title)}
            // subtitle={cart.id}
            topBarPreviousPathLabel={intl.formatMessage(messages.previous)}
            isOpen={true}
            onClose={onClose}
            isPrimaryButtonDisabled={
              !formProps.isDirty || formProps.isSubmitting
            }
            isSecondaryButtonDisabled={!formProps.isDirty}
            onSecondaryButtonClick={formProps.handleReset}
            onPrimaryButtonClick={() => formProps.submitForm()}
            labelPrimaryButton={intl.formatMessage(FormModalPage.Intl.save)}
            labelSecondaryButton={intl.formatMessage(FormModalPage.Intl.revert)}
          >
            {formProps.formElements}
          </FormModalPage>
        );
      }}
    </AssetForm>
  );
};

export default AssetsCreate;
