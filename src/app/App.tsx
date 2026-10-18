import { RouterProvider } from 'react-router';
import { useApplyTheme } from '../hooks/useTheme';
import { Providers } from './providers';
import { router } from './router';

function ThemedRouter() {
  useApplyTheme();
  return <RouterProvider router={router} />;
}

export function App() {
  return (
    <Providers>
      <ThemedRouter />
    </Providers>
  );
}
