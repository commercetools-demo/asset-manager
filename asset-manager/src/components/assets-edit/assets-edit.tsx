import { FC, useCallback } from 'react';
import { FormModalPage } from '@commercetools-frontend/application-components';
import { useIntl } from 'react-intl';
import messages from './messages';
import {
  TApiErrorNotificationOptions,
  useShowApiErrorNotification,
  useShowNotification,
} from '@commercetools-frontend/actions-global';
import { DOMAINS } from '@commercetools-frontend/constants';
import AssetForm, { TFormValues } from '../asset-form/asset-form';
import LocalizedTextInput from '@commercetools-uikit/localized-text-input';
import { transformLocalizedFieldToLocalizedString } from '@commercetools-frontend/l10n';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { transformErrors } from './transform-errors';
import { TAsset } from '../../types/generated/ctp';

type Props = {
  onEdit: (
    draft: {
      name: { [locale: string]: string };
      description: { [locale: string]: string };
      sources?: Array<{
        uri?: string;
        key?: string;
        contentType?: string;
        dimensions?: { width?: number; height?: number };
      }>;
      key?: string;
      id?: string;
    },
    asset: TAsset
  ) => Promise<void>;
  onClose: () => Promise<void>;
  asset: TAsset;
};

export const AssetsEdit: FC<Props> = ({ onClose, asset, onEdit }) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();

  const handleSubmit = useCallback(
    async (formikValues: TFormValues, formikHelpers) => {
      try {
        const draft = {
          name: LocalizedTextInput.omitEmptyTranslations(formikValues.name),
          description: LocalizedTextInput.omitEmptyTranslations(
            formikValues.description
          ),
          sources: formikValues.sources?.map((source) => {
            return {
              uri: source.uri,
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
          key:
            formikValues.key && formikValues.key.length > 0
              ? formikValues.key
              : undefined,
          id: asset.id,
        };

        await onEdit(draft, asset);

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
    []
  );

  if (!asset) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  return (
    <AssetForm
      onSubmit={handleSubmit}
      initialValues={{
        key: asset.key || '',
        name: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(asset.nameAllLocales) ?? {}
        ),
        description: LocalizedTextInput.createLocalizedString(
          projectLanguages,
          transformLocalizedFieldToLocalizedString(
            asset.descriptionAllLocales || []
          ) ?? {}
        ),
        sources: asset.sources.map((source) => {
          return {
            key: source.key || '',
            uri: source.uri || '',
            contentType: source.contentType || '',
            width: source.dimensions?.width,
            height: source.dimensions?.height,
          };
        }),
      }}
    >
      {(formProps) => {
        return (
          <FormModalPage
            title={intl.formatMessage(messages.title)}
            subtitle={asset.id}
            topBarPreviousPathLabel={intl.formatMessage(messages.previous)}
            isOpen={true}
            onClose={onClose}
            isPrimaryButtonDisabled={
              !formProps.isDirty || formProps.isSubmitting || !formProps.isValid
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

export default AssetsEdit;
