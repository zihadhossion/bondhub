import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';

import AdminRoute from './components/layout/AdminRoute';
import AdminLayout from './components/layout/AdminLayout';
import AdminAuthBootstrap from './components/layout/AdminAuthBootstrap';

import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import AdminCommunitiesPage from './pages/AdminCommunitiesPage';
import AdminCommunityDetailPage from './pages/AdminCommunityDetailPage';
import AdminCategoriesPage from './pages/AdminCategoriesPage';
import AdminPostsPage from './pages/AdminPostsPage';
import AdminPostDetailPage from './pages/AdminPostDetailPage';
import AdminCommentsPage from './pages/AdminCommentsPage';
import AdminFlaggedPage from './pages/AdminFlaggedPage';
import AdminFlagDetailPage from './pages/AdminFlagDetailPage';
import AdminExportPage from './pages/AdminExportPage';
import AdminProfilePage from './pages/AdminProfilePage';
import AdminNotFoundPage from './pages/AdminNotFoundPage';
import AdminLoginPage from './pages/AdminLoginPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AdminAuthBootstrap>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/" element={<AdminDashboardPage />} />
                <Route path="/users" element={<AdminUsersPage />} />
                <Route path="/users/:id" element={<AdminUserDetailPage />} />
                <Route path="/communities" element={<AdminCommunitiesPage />} />
                <Route path="/communities/:id" element={<AdminCommunityDetailPage />} />
                <Route path="/categories" element={<AdminCategoriesPage />} />
                <Route path="/posts" element={<AdminPostsPage />} />
                <Route path="/posts/:id" element={<AdminPostDetailPage />} />
                <Route path="/comments" element={<AdminCommentsPage />} />
                <Route path="/flagged" element={<AdminFlaggedPage />} />
                <Route path="/flagged/:id" element={<AdminFlagDetailPage />} />
                <Route path="/export" element={<AdminExportPage />} />
                <Route path="/profile" element={<AdminProfilePage />} />
              </Route>
            </Route>
            <Route path="/login" element={<AdminLoginPage />} />
            <Route path="*" element={<AdminNotFoundPage />} />
          </Routes>
          </AdminAuthBootstrap>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
