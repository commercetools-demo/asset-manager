import { ApolloError, isApolloError, ServerError } from '@apollo/client';
import {
  TGraphqlUpdateAction,
  TSyncAction,
  TSetAssetDescriptionActionPayload,
  TChangeAssetNameActionPayload,
  TAddAssetActionPayload,
} from './types';
import { transformLocalizedStringToLocalizedField } from '@commercetools-frontend/l10n';

export const getErrorMessage = (error: ApolloError) =>
  error.graphQLErrors?.map((e) => e.message).join('\n') || error.message;

const isServerError = (
  error: ApolloError['networkError']
): error is ServerError => {
  return Boolean((error as ServerError)?.result);
};

export const extractErrorFromGraphQlResponse = (graphQlResponse: unknown) => {
  if (graphQlResponse instanceof Error && isApolloError(graphQlResponse)) {
    if (
      isServerError(graphQlResponse.networkError) &&
      typeof graphQlResponse.networkError?.result !== 'string' &&
      graphQlResponse.networkError?.result?.errors.length > 0
    ) {
      return graphQlResponse?.networkError?.result.errors;
    }

    if (graphQlResponse.graphQLErrors?.length > 0) {
      return graphQlResponse.graphQLErrors;
    }
  }

  return graphQlResponse;
};

const isChangeAssetNameActionPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TChangeAssetNameActionPayload => {
  return (actionPayload as TChangeAssetNameActionPayload)?.name !== undefined;
};
const isSetAssetDescriptionActionPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TSetAssetDescriptionActionPayload => {
  return (
    (actionPayload as TSetAssetDescriptionActionPayload)?.description !==
    undefined
  );
};

const isAddAssetActionPayload = (
  actionPayload: Record<string, unknown>
): actionPayload is TAddAssetActionPayload => {
  return actionPayload.asset !== undefined;
};

const getAssetNameFromPayload = (payload: TChangeAssetNameActionPayload) => ({
  ...payload,
  name: transformLocalizedStringToLocalizedField(payload.name),
});

const getAssetDescriptionFromPayload = (
  payload: TSetAssetDescriptionActionPayload
) => ({
  ...payload,
  description: transformLocalizedStringToLocalizedField(payload.description),
});

const getAddAssetActionPayload = (payload: TAddAssetActionPayload) => {
  const asset = payload.asset;
  const { id, ...rest } = asset;
  return {
    ...payload,
    asset: {
      ...rest,
      name: transformLocalizedStringToLocalizedField(payload.asset.name),
      description: transformLocalizedStringToLocalizedField(
        payload.asset.description
      ),
    },
  };
};

const convertAction = (
  action: TSyncAction,
  defaults?: { [x: string]: unknown }
): TGraphqlUpdateAction => {
  const { action: actionName, ...actionPayload } = action;
  let actionPL = actionPayload;
  switch (actionName) {
    case 'changeAssetName': {
      if (isChangeAssetNameActionPayload(actionPayload)) {
        actionPL = getAssetNameFromPayload(actionPayload);
      }
      break;
    }
    case 'setAssetDescription': {
      if (isSetAssetDescriptionActionPayload(actionPayload)) {
        actionPL = getAssetDescriptionFromPayload(actionPayload);
      }
      break;
    }
    case 'addAsset': {
      if (isAddAssetActionPayload(actionPayload)) {
        actionPL = getAddAssetActionPayload(actionPayload);
      }
      break;
    }
  }
  return {
    [actionName]: { ...actionPL, ...defaults },
  };
};

export const createGraphQlUpdateActions = (
  actions: TSyncAction[],
  defaults?: { [x: string]: unknown }
) => {
  return actions.reduce<TGraphqlUpdateAction[]>(
    (previousActions, syncAction) => {
      return [...previousActions, convertAction(syncAction, defaults)];
    },
    []
  );
};
