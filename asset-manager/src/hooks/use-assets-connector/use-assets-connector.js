import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchAssetsQuery from './fetch-assets.ctp.graphql';

export const useAssetFetcher = ({ sku }) => {
  const { data, error, loading } = useMcQuery(FetchAssetsQuery, {
    variables: {
      sku,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    assetsPaginatedResult: data?.channels,
    error,
    loading,
  };
};
