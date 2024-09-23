import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import {
  Maybe,
  TMutation,
  TMutation_UpdateProductArgs,
  TProduct,
  TQuery,
  TQuery_ProductArgs,
} from '../../types/generated/ctp';

import UpdateQuery from './update-product.ctp.graphql';
import FetchQuery from './fetch-product.ctp.graphql';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import { ApolloError, ApolloQueryResult } from '@apollo/client';

type TUseProductFetcher = (props: TQuery_ProductArgs) => {
  product?: Maybe<TProduct>;
  error?: ApolloError;
  loading: boolean;
  refetch: (
    variables?: Partial<TQuery_ProductArgs> | undefined
  ) => Promise<ApolloQueryResult<TQuery>>;
};

export const useProductFetcher: TUseProductFetcher = (variables) => {
  const { data, error, loading, refetch } = useMcQuery<
    TQuery,
    TQuery_ProductArgs
  >(FetchQuery, {
    variables: variables,
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });
  return {
    product: data?.product,
    error,
    loading,
    refetch,
  };
};

export const useProductUpdater = () => {
  const [updateProduct, { loading }] = useMcMutation<
    TMutation,
    TMutation_UpdateProductArgs
  >(UpdateQuery);

  const execute = async ({
    actions,
    id,
    version,
  }: TMutation_UpdateProductArgs) => {
    try {
      if (actions.length > 0) {
        return await updateProduct({
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
