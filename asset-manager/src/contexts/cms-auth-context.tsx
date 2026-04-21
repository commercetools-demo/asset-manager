import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  useSharedJwtTokenFetcher,
  useSharedJwtTokenSetter,
} from '../hooks/use-shared-custom-object-storage';

interface CmsAuthContextValue {
  jwtToken: string | null;
  isAuthenticated: boolean;
  isExpired: boolean;
  loading: boolean;
  setJwtToken: (token: string | null) => Promise<void>;
  refreshJwt: () => Promise<void>;
}

const CmsAuthContext = createContext<CmsAuthContextValue | undefined>(undefined);

const getBaseUrl = (url: string) => url.replace(/\/$/, '');

export const CmsAuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [jwtToken, setJwtTokenState] = useState<string | null>(null);

  const { environment } = useApplicationContext(
    (ctx) => ({ environment: ctx.environment as { CMS_API_URL?: string } })
  );
  const baseUrl = getBaseUrl(environment?.CMS_API_URL ?? '');

  const { jwtToken: fetchedToken, loading: fetchLoading } =
    useSharedJwtTokenFetcher();
  const { setJwtToken: storeJwtToken, loading: setLoading } =
    useSharedJwtTokenSetter();

  // Tracks which token we've already attempted a refresh for, so we only try once per token.
  const refreshAttemptedForToken = useRef<string | null>(null);

  useEffect(() => {
    if (fetchedToken) {
      setJwtTokenState(fetchedToken);
    }
  }, [fetchedToken]);

  const isExpired = useMemo(() => {
    if (!jwtToken) return true;
    try {
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }, [jwtToken]);

  const setJwtToken = useCallback(
    async (token: string | null) => {
      try {
        await storeJwtToken(token);
        setJwtTokenState(token);
      } catch {
        setJwtTokenState(token);
      }
    },
    [storeJwtToken]
  );

  const refreshJwt = useCallback(async () => {
    if (!jwtToken || !baseUrl) return;
    const response = await fetch(`${baseUrl}/refresh-jwt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if (!response.ok) throw new Error('Failed to refresh JWT');
    const data = (await response.json()) as { token: string };
    await setJwtToken(data.token);
  }, [baseUrl, jwtToken, setJwtToken]);

  useEffect(() => {
    if (!jwtToken || !isExpired) return;
    if (refreshAttemptedForToken.current === jwtToken) return;
    refreshAttemptedForToken.current = jwtToken;
    void refreshJwt().catch(() => {});
  }, [jwtToken, isExpired, refreshJwt]);

  return (
    <CmsAuthContext.Provider
      value={{
        jwtToken,
        isAuthenticated: !!jwtToken,
        isExpired,
        loading: fetchLoading || setLoading,
        setJwtToken,
        refreshJwt,
      }}
    >
      {children}
    </CmsAuthContext.Provider>
  );
};

export const useCmsAuth = (): CmsAuthContextValue => {
  const context = useContext(CmsAuthContext);
  if (!context) throw new Error('useCmsAuth must be used within CmsAuthProvider');
  return context;
};
