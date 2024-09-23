import { LocalizedString } from '@commercetools-frontend/l10n/dist/declarations/src/types';

export type TSyncAction = { action: string; [x: string]: unknown };

export type TGraphqlUpdateAction = Record<string, Record<string, unknown>>;

export type TChangeAssetNameActionPayload = {
  name: LocalizedString;
};

export type TSetAssetDescriptionActionPayload = {
  description: LocalizedString;
};

export type TAddAssetActionPayload = {
  asset: { name: LocalizedString; description?: LocalizedString; id?: string };
};
