import { useCallback } from 'react';
import type { ApolloError } from '@apollo/client';
import {
  useCustomObjectFetcher,
  useCustomObjectSetter,
} from '../use-custom-objects';
export const CONFIGURATION_CONTAINER = 'contentools-configuration';
export const JWT_TOKEN_KEY = 'contentools-jwt-token';

export const useSharedJwtTokenFetcher = (): {
  jwtToken?: string;
  error?: ApolloError;
  loading: boolean;
  refetch: () => void;
} => {
  const { value, error, loading, refetch } = useCustomObjectFetcher(
    CONFIGURATION_CONTAINER,
    JWT_TOKEN_KEY
  );

  // The stored value is a JSON-encoded string: `"<token>"` → strip quotes
  let jwtToken: string | undefined;
  if (value) {
    try {
      jwtToken = typeof value === 'string' && value.startsWith('"')
        ? JSON.parse(value)
        : value;
    } catch {
      jwtToken = value;
    }
  }

  return { jwtToken, error, loading, refetch };
};

export const useSharedJwtTokenSetter = (): {
  setJwtToken: (token: string | null) => Promise<void>;
  error?: ApolloError;
  loading: boolean;
} => {
  const { setValue, error, loading } = useCustomObjectSetter(
    CONFIGURATION_CONTAINER,
    JWT_TOKEN_KEY
  );

  const setJwtToken = useCallback(
    (token: string | null) => setValue(token ? `"${token}"` : null),
    [setValue]
  );

  return { setJwtToken, error, loading };
};
