import { ApolloError } from '@apollo/client';
import FetchCustomObjectQuery from './fetch-custom-object.ctp.graphql';
import SetCustomObjectMutation from './set-custom-object.graphql';
import {
  useMcQuery,
  useMcMutation,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { useCallback } from 'react';

type TFetchCustomObjectQuery = {
  customObject?: {
    id: string;
    version: number;
    container: string;
    key: string;
    value: string;
  };
};

type TFetchCustomObjectQueryVariables = {
  container: string;
  key: string;
};

type TUseCustomObjectSetter = (
  container: string,
  key: string
) => {
  setValue: (value: string | null) => Promise<void>;
  error?: ApolloError;
  loading: boolean;
};

export const useCustomObjectSetter: TUseCustomObjectSetter = (
  container,
  key
) => {
  const [setValueMutation, { error, loading }] = useMcMutation<
    TFetchCustomObjectQuery,
    TFetchCustomObjectQueryVariables
  >(SetCustomObjectMutation, {
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
  });

  const setValue = useCallback(
    async (value: string | null) => {
      if (!value) return;
      await setValueMutation({ variables: { container, key, value } });
    },
    [setValueMutation, container, key]
  );

  return { setValue, error, loading };
};

type TUseCustomObjectFetcher = (
  container: string,
  key: string
) => {
  value?: string;
  error?: ApolloError;
  loading: boolean;
  refetch: () => void;
};

export const useCustomObjectFetcher: TUseCustomObjectFetcher = (
  container,
  key
) => {
  const { data, error, loading, refetch } = useMcQuery<
    TFetchCustomObjectQuery,
    TFetchCustomObjectQueryVariables
  >(FetchCustomObjectQuery, {
    variables: { container, key },
    context: { target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM },
  });

  const value = data?.customObject?.value;

  return { value, error, loading, refetch };
};
