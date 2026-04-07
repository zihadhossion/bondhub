import { layout, route } from '@react-router/dev/routes';

export const appRoutes = [
  layout('pages/app/layout-sidebar.tsx', [
    route('home', 'pages/FeedPage.tsx', { id: 'home' }),
    route('feed', 'pages/FeedPage.tsx', { id: 'feed' }),
  ]),
  layout('pages/app/layout-main.tsx', [
    route('posts/:id', 'pages/PostDetailPage.tsx'),
    route('posts/:id/edit', 'pages/EditPostPage.tsx'),
    route('communities', 'pages/CommunitiesPage.tsx'),
    route('communities/:id', 'pages/CommunityDetailPage.tsx'),
    route('communities/:id/create-post', 'pages/CreatePostPage.tsx', { id: 'create-post' }),
    route('communities/:id/post', 'pages/CreatePostPage.tsx', { id: 'community-post' }),
    route('profile', 'pages/ProfilePage.tsx'),
    route('profile/edit', 'pages/EditProfilePage.tsx'),
    route('profile/following', 'pages/FollowingPage.tsx'),
    route('profile/followers', 'pages/FollowersPage.tsx'),
    route('users/:id', 'pages/UserProfilePage.tsx'),
    route('settings', 'pages/SettingsPage.tsx'),
    route('notifications', 'pages/NotificationsPage.tsx'),
  ]),
];
