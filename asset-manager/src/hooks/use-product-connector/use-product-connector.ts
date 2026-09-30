import { OperationVariables } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell-connectors';
import {
  TAsset,
  TMutation_UpdateProductArgs,
  TQuery_ProductArgs,
} from '../../types/generated/ctp';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import { mcApiContext } from '../shared/mc-api-context';
import FetchQuery from './fetch.ctp.graphql';
import UpdateMutation from './update.ctp.graphql';

// Hand-narrowed to the fragment shape: the generated TQuery/TProduct types are
// recursive enough to hit TypeScript's instantiation depth limit (TS2589).
export type TProductVariantWithAssets = {
  id: number;
  sku?: string | null;
  key?: string | null;
  assets: Array<TAsset>;
};

export type TProductWithAssets = {
  id: string;
  version: number;
  masterData: {
    current?: {
      masterVariant: TProductVariantWithAssets;
      variants: Array<TProductVariantWithAssets>;
    } | null;
  };
};

type TFetchProductQuery = { product?: TProductWithAssets | null };

type TUpdateProductMutation = {
  updateProduct?: { id: string; version: number } | null;
};

export const useProductFetcher = (variables: TQuery_ProductArgs) => {
  const { data, error, loading, refetch } = useMcQuery<
    TFetchProductQuery,
    TQuery_ProductArgs & OperationVariables
  >(FetchQuery, { variables, context: mcApiContext });
  return { product: data?.product, error, loading, refetch };
};

export const useProductUpdater = () => {
  const [executeMutation, { loading }] = useMcMutation<
    TUpdateProductMutation,
    TMutation_UpdateProductArgs & OperationVariables
  >(UpdateMutation, { context: mcApiContext });

  const execute = async (variables: TMutation_UpdateProductArgs) => {
    try {
      const result = await executeMutation({ variables });
      return {
        updateProduct: result.data?.updateProduct,
        errors: result.errors,
      };
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};
