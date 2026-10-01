import { act } from 'react';
import { NimbusProvider } from '@commercetools/nimbus';
import { renderCustomView } from '@commercetools-frontend/application-shell/test-utils';
import ApplicationRoutes from '../routes';

export const projectKey = 'my-project';

// The real app gets NimbusProvider from the entry point, outside the shell.
// Rendering inside an async act lets React 19 pick up the lazily loaded route
// chunks; with a plain (sync) render the first test of a file stays on the
// Suspense fallback because the chunk resolves outside act.
export const renderAssetManager = async (hostPath: string) => {
  let result: ReturnType<typeof renderCustomView> | undefined;
  await act(async () => {
    result = renderCustomView({
      locale: 'en',
      projectKey,
      customViewHostUrl: `https://mc.europe-west1.gcp.commercetools.com/${projectKey}${hostPath}`,
      children: (
        <NimbusProvider>
          <ApplicationRoutes />
        </NimbusProvider>
      ),
    });
  });
  return result as ReturnType<typeof renderCustomView>;
};
