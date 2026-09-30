import { lazy } from 'react';
import {
  createApolloClient,
  CustomViewShell,
  setupGlobalErrorListener,
} from '@commercetools-frontend/application-shell';
import { NimbusProvider, NimbusI18nProvider } from '@commercetools/nimbus';
import loadMessages from '../../load-messages';

// Here we split up the main (app) bundle with the actual application business logic.
// Splitting by route is usually recommended and you can potentially have a splitting
// point for each route. More info at https://reactjs.org/docs/code-splitting.html
const AsyncApplicationRoutes = lazy(
  () => import('../../routes' /* webpackChunkName: "routes" */)
);

// Ensure to setup the global error listener before any React component renders
// in order to catch possible errors on rendering/mounting.
setupGlobalErrorListener();

// A variant's `id` is only unique within its product (1 = master variant), so
// Apollo's default `ProductVariant:${id}` key would merge variants of different
// products. `sku` isn't an option since it's optional on variants; store them
// inside their parent product instead.
const apolloClient = createApolloClient({
  cache: {
    typePolicies: {
      ProductVariant: { keyFields: false },
    },
  },
});

const EntryPoint = () => (
  <NimbusProvider>
    <NimbusI18nProvider locale="en-US">
      <CustomViewShell
        applicationMessages={loadMessages}
        apolloClient={apolloClient}
      >
        <AsyncApplicationRoutes />
      </CustomViewShell>
    </NimbusI18nProvider>
  </NimbusProvider>
);

EntryPoint.displayName = 'EntryPoint';

export default EntryPoint;
