import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchAssetsQuery from './fetch-assets.ctp.graphql';
import { useMemo } from 'react';

export const useAssetFetcher = ({ productId, variantId }) => {
  const where = `id="${productId}"`;
  const { data, error, loading } = useMcQuery(FetchAssetsQuery, {
    variables: {
      where,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const result = useMemo(() => {
    console.log(variantId);
    if (!loading && !!data?.products?.results?.[0]) {
      const masterVariant = data.products.results[0].masterData?.current?.masterVariant;
      const variants = data.products.results[0].masterData?.current?.variants || [];
      console.log({ masterVariant, variants });
      return [masterVariant, ...variants].find((variant) => variant?.id === parseInt(variantId, 10));
    }
    return null;
  }, [loading, data, variantId])

  return {
    variant: result,
    error,
    loading,
  };
};
