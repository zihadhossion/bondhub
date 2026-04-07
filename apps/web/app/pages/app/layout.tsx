import { Navigate, Outlet } from 'react-router';
import { useAppSelector } from '~/hooks/useAppSelector';

export default function AppProtectedLayout() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
