import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Tag,
  FileText,
  MessageSquare,
  Flag,
  Download,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Users', to: '/users', icon: Users },
  { label: 'Communities', to: '/communities', icon: BookOpen },
  { label: 'Categories', to: '/categories', icon: Tag },
  { label: 'Posts', to: '/posts', icon: FileText },
  { label: 'Comments', to: '/comments', icon: MessageSquare },
  { label: 'Flagged Content', to: '/flagged', icon: Flag },
  { label: 'Export', to: '/export', icon: Download },
];

export default function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[240px] bg-[#0D1117] z-40 flex flex-col" style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Logo */}
      <div className="h-[64px] flex items-center px-6 gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link to="/" className="text-[20px] font-bold text-[#ED1C24]" style={{ textShadow: '0 0 20px rgba(237,28,36,0.5)' }}>
          BondHub
        </Link>
        <span className="text-[10px] font-semibold px-[6px] py-[2px] rounded-full bg-[rgba(168,85,247,0.15)] text-[#A855F7]">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const isActive = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
            const Icon = item.icon;

            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-[10px] rounded-[8px] text-sm font-medium transition ${
                    isActive
                      ? 'sidebar-active text-[#F9FAFB]'
                      : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[rgba(255,255,255,0.04)]'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
