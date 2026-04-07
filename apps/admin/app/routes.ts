import { type RouteConfig, layout, route } from '@react-router/dev/routes';
import { adminRoutes } from './routes/admin.routes';
import { authRoutes } from './routes/auth.routes';

export default [
  layout('pages/admin/layout.tsx', adminRoutes),
  ...authRoutes,
  route('*', 'pages/AdminNotFoundPage.tsx'),
] satisfies RouteConfig;
