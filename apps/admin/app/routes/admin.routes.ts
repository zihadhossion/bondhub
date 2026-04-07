import { index, route } from '@react-router/dev/routes';

export const adminRoutes = [
  index('pages/AdminDashboardPage.tsx'),
  route('users', 'pages/AdminUsersPage.tsx'),
  route('users/:id', 'pages/AdminUserDetailPage.tsx'),
  route('communities', 'pages/AdminCommunitiesPage.tsx'),
  route('communities/:id', 'pages/AdminCommunityDetailPage.tsx'),
  route('categories', 'pages/AdminCategoriesPage.tsx'),
  route('posts', 'pages/AdminPostsPage.tsx'),
  route('posts/:id', 'pages/AdminPostDetailPage.tsx'),
  route('comments', 'pages/AdminCommentsPage.tsx'),
  route('flagged', 'pages/AdminFlaggedPage.tsx'),
  route('flagged/:id', 'pages/AdminFlagDetailPage.tsx'),
  route('export', 'pages/AdminExportPage.tsx'),
  route('profile', 'pages/AdminProfilePage.tsx'),
];
