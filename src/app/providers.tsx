import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import i18n from '../i18n';
import { ApiError, lastRefreshUser, refreshSession, setSessionExpiredHandler } from '../services/api/apiClient';
import { signedIn, signedOut, store, useAppSelector } from './store';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Pas de nouvel essai sur une erreur métier (4xx) ; oui sur le réseau.
      retry: (count, error) => !(error instanceof ApiError && error.status >= 400 && error.status < 500) && count < 2,
      // Hors-ligne : on garde les données en cache affichées (section 6.4).
      networkMode: 'offlineFirst',
    },
  },
  mutationCache: new MutationCache(),
});

/** Restaure la session depuis le cookie au démarrage. */
function SessionBootstrap({ children }: { children: ReactNode }) {
  const locale = useAppSelector((s) => s.session.user?.locale);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.clear();
      store.dispatch(signedOut());
    });
    void refreshSession().then((ok) => {
      store.dispatch(ok && lastRefreshUser ? signedIn(lastRefreshUser) : signedOut());
    });
  }, []);

  // La langue du profil s'applique à tous les écrans (US-33).
  useEffect(() => {
    if (locale && locale !== i18n.language) void i18n.changeLanguage(locale);
  }, [locale]);

  return children;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SessionBootstrap>{children}</SessionBootstrap>
      </QueryClientProvider>
    </Provider>
  );
}
