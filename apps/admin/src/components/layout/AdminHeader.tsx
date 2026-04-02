import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, LogOut, User as UserIcon, CheckCheck } from 'lucide-react';
import { useAppSelector } from '../../hooks/useAppSelector';
import { useAppDispatch } from '../../hooks/useAppSelector';
import { clearCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/api/auth.service';
import {
  useUnreadCount,
  useNotificationList,
  useMarkAsRead,
  useMarkAllAsRead,
} from '../../hooks/useNotifications';

interface AdminHeaderProps {
  breadcrumb?: string;
}

export default function AdminHeader({ breadcrumb = 'Dashboard' }: AdminHeaderProps) {
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const { data: unreadCount = 0 } = useUnreadCount();
  const { data: notifData, isLoading: notifLoading } = useNotificationList(1, notifOpen);
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleLogout() {
    try {
      await authService.logout();
    } catch {
      // ignore — clear client state regardless
    }
    dispatch(clearCredentials());
    navigate('/login');
  }

  function toggleNotif() {
    setNotifOpen((v) => !v);
    setUserMenuOpen(false);
  }

  function toggleUserMenu() {
    setUserMenuOpen((v) => !v);
    setNotifOpen(false);
  }

  const notifications = notifData?.data ?? [];

  return (
    <header
      className="fixed top-0 left-[240px] right-0 z-30 h-[64px] bg-[#0B0F1A] flex items-center px-6 gap-4"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Breadcrumb */}
      <div className="flex-1">
        <span className="text-sm text-[#9CA3AF]">Admin</span>
        <span className="text-sm text-[#9CA3AF] mx-2">/</span>
        <span className="text-sm font-medium text-[#F9FAFB]">{breadcrumb}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div
          className="hidden md:flex items-center bg-[#1F2937] rounded-[10px] px-3 py-2 gap-2"
          style={{ border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Search className="w-4 h-4 text-[#6B7280]" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-sm text-[#F9FAFB] outline-none w-[160px] placeholder:text-[#6B7280]"
          />
        </div>

        {/* Bell + Notification Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            className="relative p-2 text-[#9CA3AF] hover:text-[#F9FAFB] transition"
            onClick={toggleNotif}
          >
            <Bell className="w-5 h-5" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-[#ED1C24] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-[340px] rounded-[12px] bg-[#111827] shadow-xl z-50 overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-sm font-semibold text-[#F9FAFB]">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => markAllAsRead()}
                    disabled={markingAll}
                    className="flex items-center gap-1 text-xs text-[#ED1C24] hover:text-[#f44] transition disabled:opacity-50"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-[320px] overflow-y-auto">
                {notifLoading ? (
                  <div className="py-8 text-center text-sm text-[#6B7280]">Loading…</div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-sm text-[#6B7280]">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.id);
                      }}
                      className={`w-full text-left px-4 py-3 flex gap-3 transition hover:bg-[#1F2937] ${!n.isRead ? 'bg-[rgba(237,28,36,0.05)]' : ''}`}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${!n.isRead ? 'bg-[#ED1C24]' : 'bg-transparent'}`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#F9FAFB] truncate">{n.title}</p>
                        <p className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-[#4B5563] mt-1">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar + User Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={toggleUserMenu}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ED1C24] to-[#F472B6] flex items-center justify-center text-xs font-bold text-white overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
              ) : (
                user?.displayName?.[0]?.toUpperCase() ?? 'A'
              )}
            </div>
            <span className="hidden md:block text-xs font-semibold px-[6px] py-[2px] rounded-full bg-[rgba(237,28,36,0.15)] text-[#ED1C24]">
              Admin
            </span>
          </button>

          {userMenuOpen && (
            <div
              className="absolute right-0 top-[calc(100%+8px)] w-[220px] rounded-[12px] bg-[#111827] shadow-xl z-50 overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* User info */}
              <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#ED1C24] to-[#F472B6] flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.displayName} className="w-full h-full object-cover" />
                    ) : (
                      user?.displayName?.[0]?.toUpperCase() ?? 'A'
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#F9FAFB] truncate">{user?.displayName}</p>
                    <p className="text-[10px] text-[#6B7280] truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Profile link placeholder */}
              <div className="px-2 py-1">
                <button
                  type="button"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs text-[#9CA3AF] hover:bg-[#1F2937] hover:text-[#F9FAFB] transition"
                  onClick={() => { setUserMenuOpen(false); navigate('/profile'); }}
                >
                  <UserIcon className="w-4 h-4" strokeWidth={1.5} />
                  Profile
                </button>
              </div>

              {/* Logout */}
              <div className="px-2 pb-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-xs text-[#ED1C24] hover:bg-[rgba(237,28,36,0.1)] transition mt-1"
                >
                  <LogOut className="w-4 h-4" strokeWidth={1.5} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
