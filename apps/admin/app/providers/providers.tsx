import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '~/store';
import AdminAuthBootstrap from '~/components/layout/AdminAuthBootstrap';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AdminAuthBootstrap>
          {children}
        </AdminAuthBootstrap>
      </QueryClientProvider>
    </Provider>
  );
}
