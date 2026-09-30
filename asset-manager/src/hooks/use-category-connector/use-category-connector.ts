import { OperationVariables } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell-connectors';
import {
  TAsset,
  TMutation_UpdateCategoryArgs,
  TQuery_CategoryArgs,
} from '../../types/generated/ctp';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import { mcApiContext } from '../shared/mc-api-context';
import FetchQuery from './fetch.ctp.graphql';
import UpdateMutation from './update.ctp.graphql';

// Hand-narrowed to the fragment shape: the generated TQuery/TCategory types are
// recursive enough to hit TypeScript's instantiation depth limit (TS2589).
export type TCategoryWithAssets = {
  id: string;
  key?: string | null;
  version: number;
  assets: Array<TAsset>;
};

type TFetchCategoryQuery = { category?: TCategoryWithAssets | null };

type TUpdateCategoryMutation = { updateCategory?: TCategoryWithAssets | null };

export const useCategoryFetcher = (variables: TQuery_CategoryArgs) => {
  const { data, error, loading, refetch } = useMcQuery<
    TFetchCategoryQuery,
    TQuery_CategoryArgs & OperationVariables
  >(FetchQuery, { variables, context: mcApiContext });
  return { category: data?.category, error, loading, refetch };
};

export const useCategoryUpdater = () => {
  const [executeMutation, { loading }] = useMcMutation<
    TUpdateCategoryMutation,
    TMutation_UpdateCategoryArgs & OperationVariables
  >(UpdateMutation, { context: mcApiContext });

  const execute = async (variables: TMutation_UpdateCategoryArgs) => {
    try {
      const result = await executeMutation({ variables });
      return {
        updateCategory: result.data?.updateCategory,
        errors: result.errors,
      };
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return { loading, execute };
};
