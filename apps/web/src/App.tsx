import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from './store';

import AuthLayout from './components/layout/AuthLayout';
import UserLayout from './components/layout/UserLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AuthBootstrap from './components/layout/AuthBootstrap';

import SplashPage from './pages/SplashPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import FeedPage from './pages/FeedPage';
import PostDetailPage from './pages/PostDetailPage';
import EditPostPage from './pages/EditPostPage';
import CommunitiesPage from './pages/CommunitiesPage';
import CommunityDetailPage from './pages/CommunityDetailPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import FollowingPage from './pages/FollowingPage';
import FollowersPage from './pages/FollowersPage';
import UserProfilePage from './pages/UserProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotificationsPage from './pages/NotificationsPage';
import NotFoundPage from './pages/NotFoundPage';

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
          <AuthBootstrap>
          <Routes>
            {/* Standalone */}
            <Route path="/" element={<SplashPage />} />

            {/* Auth */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              {/* Feed layout with sidebar */}
              <Route element={<UserLayout showSidebar={true} />}>
                <Route path="/home" element={<FeedPage />} />
                <Route path="/feed" element={<FeedPage />} />
              </Route>

              {/* Standard user layout */}
              <Route element={<UserLayout />}>
                <Route path="/posts/:id" element={<PostDetailPage />} />
                <Route path="/posts/:id/edit" element={<EditPostPage />} />
                <Route path="/communities" element={<CommunitiesPage />} />
                <Route path="/communities/:id" element={<CommunityDetailPage />} />
                <Route path="/communities/:id/create-post" element={<CreatePostPage />} />
                <Route path="/communities/:id/post" element={<CreatePostPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/edit" element={<EditProfilePage />} />
                <Route path="/profile/following" element={<FollowingPage />} />
                <Route path="/profile/followers" element={<FollowersPage />} />
                <Route path="/users/:id" element={<UserProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </AuthBootstrap>
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
