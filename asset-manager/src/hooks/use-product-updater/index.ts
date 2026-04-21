import { useMcMutation } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import UpdateProductMutation from './update-product.ctp.graphql';

type TUpdateProductVariables = {
  id?: string;
  key?: string;
  version: number;
  actions: Record<string, unknown>[];
  includeAssets?: boolean;
};

type TUpdateProductResult = {
  updateProduct?: {
    id: string;
    version: number;
  };
};

export const useProductUpdater = () => {
  const [executeMutation, { loading }] = useMcMutation<
    TUpdateProductResult,
    TUpdateProductVariables
  >(UpdateProductMutation, {
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
  });

  const execute = async (variables: TUpdateProductVariables) => {
    try {
      const result = await executeMutation({ variables });
      return {
        updateProduct: result.data?.updateProduct,
        errors: result.errors,
      };
    } catch (err) {
      throw err;
    }
  };

  return { loading, execute };
};
