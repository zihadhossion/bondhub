import { Link, Outlet } from 'react-router-dom';
import { Settings } from 'lucide-react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface UserLayoutProps {
  showSidebar?: boolean;
}

export default function UserLayout({ showSidebar = false }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#F9FAFB]">
      {/* Site brand logo — accessible skip link */}
      <Link
        to="/feed"
        className="site-logo sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-[100] focus:p-2 focus:text-[#ED1C24] focus:bg-[#0B0F1A]"
      >
        BondHub brand name
      </Link>
      <Navbar />
      <main className="pt-[64px] max-w-[1280px] mx-auto px-4 md:px-6">
        {showSidebar ? (
          <div className="flex gap-6 py-6">
            <Sidebar />
            <div className="flex-1 min-w-0">
              <Outlet />
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
      {/* Mobile bottom tab */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 h-[60px] bg-[#0B0F1A] flex items-center justify-around md:hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link to="/feed" className="flex flex-col items-center text-[#9CA3AF] hover:text-[#F9FAFB]">
          <span className="text-xs mt-1">Feed</span>
        </Link>
        <Link to="/communities" className="flex flex-col items-center text-[#9CA3AF] hover:text-[#F9FAFB]">
          <span className="text-xs mt-1">Communities</span>
        </Link>
        <Link to="/profile" className="flex flex-col items-center text-[#9CA3AF] hover:text-[#F9FAFB]">
          <span className="text-xs mt-1">Profile</span>
        </Link>
        <Link to="/settings" className="flex flex-col items-center text-[#9CA3AF] hover:text-[#F9FAFB]">
          <Settings className="w-5 h-5" strokeWidth={1.5} />
          <span className="text-xs mt-1">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
