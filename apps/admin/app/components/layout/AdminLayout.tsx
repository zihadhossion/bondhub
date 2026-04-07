import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const breadcrumbMap: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/communities': 'Communities',
  '/categories': 'Categories',
  '/posts': 'Posts',
  '/comments': 'Comments',
  '/flagged': 'Flagged Content',
  '/export': 'Export',
  '/profile': 'My Profile',
};

export default function AdminLayout() {
  const location = useLocation();
  const basePath = '/' + location.pathname.split('/')[1];
  const breadcrumb = breadcrumbMap[basePath] ?? 'Dashboard';

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#F9FAFB]">
      <AdminSidebar />
      <AdminHeader breadcrumb={breadcrumb} />
      <main className="md:ml-[240px] pt-[64px] p-6">
        <Outlet />
      </main>
    </div>
  );
}
