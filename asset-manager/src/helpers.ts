import { ApolloError, isApolloError, ServerError } from '@apollo/client';
import {
  TGraphqlUpdateAction,
  TSyncAction,
  TSetAssetDescriptionActionPayload,
  TChangeAssetNameActionPayload,
  TAddAssetActionPayload,
} from './types';
import { transformLocalizedStringToLocalizedField } from '@commercetools-frontend/l10n';
import { LocalizedField } from '@commercetools/nimbus';
import type { createSyncProducts } from '@commercetools/sync-actions';

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

type TRestSource = {
  uri: string;
  key?: string;
  contentType?: string;
  dimensions?: { w: number; h: number };
};

const toGraphQlSource = ({ dimensions, ...source }: TRestSource) => ({
  ...source,
  ...(dimensions && {
    dimensions: { width: dimensions.w, height: dimensions.h },
  }),
});

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
    case 'setAssetSources': {
      const sources = actionPayload.sources as Array<TRestSource> | undefined;
      actionPL = { ...actionPayload, sources: sources?.map(toGraphQlSource) };
      break;
    }
  }
  return {
    [actionName]: { ...actionPL, ...defaults },
  };
};

export const createGraphQlUpdateActions = (
  actions: ReadonlyArray<{ action: string }>,
  defaults?: { [x: string]: unknown }
) => {
  return actions.reduce<TGraphqlUpdateAction[]>(
    (previousActions, syncAction) => {
      return [
        ...previousActions,
        convertAction(syncAction as TSyncAction, defaults),
      ];
    },
    []
  );
};

// sync-actions diffs REST-shaped resources (`dimensions: { w, h }`, no
// `null`s), while this app works with GraphQL-shaped data; these map between
// the two at the diff boundary.
type TProductSyncer = ReturnType<typeof createSyncProducts>;
export type TSyncProductDraft = Parameters<TProductSyncer['buildActions']>[0];
export type TProductSyncAction = ReturnType<
  TProductSyncer['buildActions']
>[number];

type TAssetSourceLike = {
  uri?: string | null;
  key?: string | null;
  contentType?: string | null;
  dimensions?: { width?: number | null; height?: number | null } | null;
};

export const toRestSource = (source: TAssetSourceLike): TRestSource => ({
  uri: source.uri ?? '',
  ...(source.key && { key: source.key }),
  ...(source.contentType && { contentType: source.contentType }),
  ...(source.dimensions?.width != null &&
    source.dimensions?.height != null && {
      dimensions: { w: source.dimensions.width, h: source.dimensions.height },
    }),
});

export const toRestAsset = (asset: {
  id?: string;
  key?: string | null;
  name: Record<string, string>;
  description?: Record<string, string>;
  sources?: ReadonlyArray<TAssetSourceLike>;
}) => ({
  ...(asset.id && { id: asset.id }),
  ...(asset.key && { key: asset.key }),
  name: asset.name,
  description: asset.description ?? {},
  sources: (asset.sources ?? []).map(toRestSource),
});

export const omitEmptyTranslations = (
  localizedString: Record<string, string>
) =>
  LocalizedField.omitEmptyTranslations(localizedString) as Record<
    string,
    string
  >;

export const createLocalizedString = (
  locales: string[],
  existingLocalizedString: Record<string, string>
) =>
  LocalizedField.createLocalizedString(
    locales,
    existingLocalizedString
  ) as Record<string, string>;
