import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchAssetsQuery from './fetch-assets.ctp.graphql';
import AddAssetMutation from './add-asset.ctp.graphql';
import { useMemo } from 'react';

export const useAsset = ({ productId, variantId }) => {
  const where = `id="${productId}"`;
  const {
    data,
    error: fetchError,
    loading: fetchLoading,
  } = useMcQuery(FetchAssetsQuery, {
    variables: {
      where,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const [execute, { error: addError, loading: addLoading }] =
    useMcMutation(AddAssetMutation);

  const addAsset = async (asset, version) => {
    return execute({
      variables: {
        version,
        productId,
        actions: [
          {
            addAsset: {
              variantId: parseInt(variantId, 10),
              staged: false,
              asset: {
                name: asset.name,
                sources: [
                  {
                    uri: asset.uri,
                  },
                ],
                description: asset.description,
              },
            },
          },
        ],
      },
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
    });
  };

  const version = useMemo(() => {
    if (!fetchLoading && !!data?.products?.results?.[0]) {
      return parseInt(data.products.results[0].version, 10);
    }
    return null;
  }, [data, fetchLoading]);

  const result = useMemo(() => {
    if (!fetchLoading && !!data?.products?.results?.[0]) {
      const masterVariant =
        data.products.results[0].masterData?.current?.masterVariant;
      const variants =
        data.products.results[0].masterData?.current?.variants || [];
      return [masterVariant, ...variants].find(
        (variant) => variant?.id === parseInt(variantId, 10)
      );
    }
    return null;
  }, [fetchLoading, data, variantId]);

  return {
    variant: result,
    version,
    addAsset,
    error: fetchError,
    loading: fetchLoading,
    addLoading,
  };
};
