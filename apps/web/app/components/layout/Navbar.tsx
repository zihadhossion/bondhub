import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Bell, Search, Plus, User, Settings } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useUnreadCount } from '../../hooks/useNotifications';

export default function Navbar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  const feedActive = pathname === '/feed' || pathname === '/home';
  const communitiesActive = pathname.startsWith('/communities');

  const activeClass = 'text-sm font-medium pb-1 text-[#ED1C24]';
  const activeStyle = { borderBottom: '2px solid #ED1C24', boxShadow: '0 2px 8px rgba(237,28,36,0.3)' };
  const inactiveClass = 'text-sm font-medium text-[#9CA3AF] hover:text-[#F9FAFB] transition';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-[64px] bg-[#0B0F1A] flex items-center px-6"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <nav className="w-full max-w-[1280px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link
            to="/feed"
            className="site-logo text-[22px] font-bold text-[#ED1C24]"
            aria-label="BondHub logo"
            style={{ textShadow: '0 0 20px rgba(237,28,36,0.5)' }}
          >
            BondHub
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/feed"
              className={feedActive ? activeClass : inactiveClass}
              style={feedActive ? activeStyle : {}}
            >
              Feed
            </Link>
            <Link
              to="/communities"
              className={communitiesActive ? activeClass : inactiveClass}
              style={communitiesActive ? activeStyle : {}}
            >
              Communities
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="hidden md:flex items-center bg-[#1F2937] rounded-[10px] px-3 py-2 gap-2"
            style={{ border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Search className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent text-sm text-[#F9FAFB] outline-none w-[180px] placeholder:text-[#6B7280]"
            />
          </div>
          <button
            type="button"
            className="relative p-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition cursor-pointer"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ED1C24] rounded-full" />
            )}
          </button>
          <Link
            to="/communities"
            className="hidden md:flex text-white text-sm font-semibold px-4 py-2 rounded-[8px] items-center gap-2 transition"
            style={{ background: 'linear-gradient(135deg, #ED1C24, #F472B6)' }}
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} /> New Post
          </Link>
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ED1C24] to-[#F472B6] cursor-pointer"
              onClick={() => setProfileOpen((prev) => !prev)}
              aria-label="Profile menu"
            >
              {user?.profilePicture && (
                <img src={user.profilePicture} alt={user.displayName} className="w-full h-full rounded-full object-cover" />
              )}
            </button>
            {profileOpen && (
              <div
                className="absolute right-0 mt-2 w-[160px] rounded-[10px] bg-[#1F2937] py-1 z-50"
                style={{ border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
              >
                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#D1D5DB] hover:text-[#F9FAFB] hover:bg-[#374151] transition"
                >
                  <User className="w-4 h-4" strokeWidth={1.5} />
                  View Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-[#D1D5DB] hover:text-[#F9FAFB] hover:bg-[#374151] transition"
                >
                  <Settings className="w-4 h-4" strokeWidth={1.5} />
                  Settings
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
