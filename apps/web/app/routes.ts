import { type RouteConfig, layout, route } from '@react-router/dev/routes';
import { publicRoutes } from './routes/public.routes';
import { authRoutes } from './routes/auth.routes';
import { appRoutes } from './routes/app.routes';

export default [
  ...publicRoutes,
  layout('pages/auth/layout.tsx', authRoutes),
  layout('pages/app/layout.tsx', appRoutes),
  route('*', 'pages/NotFoundPage.tsx'),
] satisfies RouteConfig;
