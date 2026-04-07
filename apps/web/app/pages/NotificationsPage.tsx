import { useNavigate } from 'react-router-dom';
import { Bell, UserPlus, MessageCircle, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications, useMarkAsRead, useMarkAllAsRead, useDeleteNotification } from '../hooks/useNotifications';
import type { Notification } from '../types';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function NotificationIcon({ type }: { type: Notification['type'] }) {
  if (type === 'new_follower') {
    return (
      <div className="w-9 h-9 rounded-full bg-[#1F2937] flex items-center justify-center flex-shrink-0">
        <UserPlus className="w-4 h-4 text-[#ED1C24]" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-[#1F2937] flex items-center justify-center flex-shrink-0">
      <MessageCircle className="w-4 h-4 text-[#60A5FA]" strokeWidth={1.5} />
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const navigate = useNavigate();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: deleteNotification } = useDeleteNotification();

  function handleClick() {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.relatedPostId) {
      navigate(`/posts/${notification.relatedPostId}`);
    } else if (notification.relatedUserId) {
      navigate(`/users/${notification.relatedUserId}`);
    }
  }

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors ${
        notification.isRead ? 'bg-transparent' : 'bg-[#1A1F2E]'
      } hover:bg-[#1F2937]`}
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      onClick={handleClick}
    >
      {!notification.isRead && (
        <span className="mt-[14px] w-2 h-2 rounded-full bg-[#ED1C24] flex-shrink-0" />
      )}
      {notification.isRead && <span className="mt-[14px] w-2 h-2 flex-shrink-0" />}
      <NotificationIcon type={notification.type} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[#F9FAFB]">{notification.title}</p>
        <p className="text-sm text-[#9CA3AF] mt-0.5 truncate">{notification.message}</p>
        <p className="text-xs text-[#6B7280] mt-1">{timeAgo(notification.createdAt)}</p>
      </div>
      <button
        type="button"
        className="p-1.5 text-[#6B7280] hover:text-[#EF4444] transition flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          deleteNotification(notification.id);
        }}
        aria-label="Delete notification"
      >
        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export default function NotificationsPage() {
  const { data, isLoading } = useNotifications();
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead();

  const notifications = data?.data ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <main className="max-w-[680px] mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-[#F9FAFB]">Notifications</h1>
        {hasUnread && (
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm text-[#9CA3AF] hover:text-[#F9FAFB] transition"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
          >
            <CheckCheck className="w-4 h-4" strokeWidth={1.5} />
            Mark all as read
          </button>
        )}
      </div>

      <div
        className="rounded-[12px] bg-[#111827] overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-[#ED1C24] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Bell className="w-10 h-10 text-[#374151]" strokeWidth={1.5} />
            <p className="text-[#6B7280] text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        )}
      </div>
    </main>
  );
}
