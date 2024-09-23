import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  Maybe,
  TMutation,
  TMutation_UpdateCategoryArgs,
  TCategory,
  TQuery,
  TQuery_CategoryArgs,
} from '../../types/generated/ctp';

import UpdateQuery from './update-category.ctp.graphql';
import FetchQuery from './fetch-category.ctp.graphql';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import { ApolloError, ApolloQueryResult } from '@apollo/client';

type TUseCategoryFetcher = (props: TQuery_CategoryArgs) => {
  category?: Maybe<TCategory>;
  error?: ApolloError;
  loading: boolean;
  refetch: (
    variables?: Partial<TQuery_CategoryArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

export const useCategoryFetcher: TUseCategoryFetcher = (variables) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_CategoryArgs
  >(FetchQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    category: data?.category,
    error,
    loading,
    refetch,
  };
};

export const useCategoryUpdater = () => {
  const [updateCategory, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateCategoryArgs
  >(UpdateQuery);

  const execute = async ({
    actions,
    id,
    version,
  }: TMutation_UpdateCategoryArgs) => {
    try {
      if (actions.length > 0) {
        return await updateCategory({
          context: {
            target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
          },
          variables: {
            id: id,
            version: version || 1,
            actions: actions,
          },
        });
      }
      return Promise.resolve(undefined);
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};
