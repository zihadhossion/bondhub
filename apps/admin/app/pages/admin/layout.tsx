import { Navigate } from 'react-router';
import { useAppSelector } from '~/hooks/useAppSelector';
import AdminLayout from '~/components/layout/AdminLayout';

export default function AdminProtectedLayout() {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
}
