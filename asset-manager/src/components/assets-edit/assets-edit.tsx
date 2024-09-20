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
import {
  useProductFetcher,
  useProductUpdater,
} from '../../hooks/use-assets-connector';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Text from '@commercetools-uikit/text';
import { createGraphQlUpdateActions, getErrorMessage } from '../../helpers';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { createSyncProducts } from '@commercetools/sync-actions';
import { transformErrors } from './transform-errors';
const syncProducts = createSyncProducts();

type Props = {
  onClose: () => Promise<void>;
  productId: string;
  assetId: string;
  variantId: number;
  version: number;
};

export const AssetsEdit: FC<Props> = ({
  productId,
  variantId,
  version,
  onClose,
  assetId,
}) => {
  const intl = useIntl();
  const { projectLanguages } = useApplicationContext((context) => ({
    projectLanguages: context.project?.languages ?? [],
  }));
  const showNotification = useShowNotification();
  const showApiErrorNotification = useShowApiErrorNotification();

  const { loading, error, product } = useProductFetcher({
    id: productId,
  });

  const productUpdater = useProductUpdater();

  const masterVariant = product?.masterData?.current?.masterVariant;
  const variants = product?.masterData?.current?.variants || [];
  const variant = [masterVariant, ...variants].find(
    (variant) => variant?.id === variantId
  );
  const asset = variant?.assets.find((asset) => asset.id === assetId);

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
          id: assetId,
        };

        const before = {
          masterVariant: {
            sku: variant?.sku,
            id: variant?.id,
            key: variant?.key,
            assets: [
              {
                name: transformLocalizedFieldToLocalizedString(
                  asset?.nameAllLocales || []
                ),
                description:
                  transformLocalizedFieldToLocalizedString(
                    asset?.descriptionAllLocales || []
                  ) || {},
                sources: asset?.sources,
                id: assetId,
                key: asset?.key,
              },
            ],
          },
        };

        const now = {
          masterVariant: {
            sku: variant?.sku,
            id: variant?.id,
            assets: [
              // new image
              {
                ...draft,
              },
            ],
          },
        };

        const actions = syncProducts.buildActions(now, before);
        let translatedActions = createGraphQlUpdateActions(actions);
        await productUpdater.execute({
          id: productId,
          version: version,
          actions: translatedActions,
        });

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

  if (error) {
    return (
      <ContentNotification type="error">
        <Text.Body>{getErrorMessage(error)}</Text.Body>
      </ContentNotification>
    );
  }
  if (loading) {
    return (
      <Spacings.Stack alignItems="center">
        <LoadingSpinner />
      </Spacings.Stack>
    );
  }

  if (!product) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

  if (!variant) {
    return (
      <ContentNotification type="info">
        <Text.Body intlMessage={messages.noResults} />
      </ContentNotification>
    );
  }

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
            subtitle={assetId}
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
