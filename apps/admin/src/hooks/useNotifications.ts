import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '../services/api/notification.service';

const KEYS = {
  unreadCount: ['notifications', 'unread-count'] as const,
  list: (page: number) => ['notifications', 'list', page] as const,
};

export function useUnreadCount() {
  return useQuery({
    queryKey: KEYS.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 30_000,
  });
}

export function useNotificationList(page: number, enabled: boolean) {
  return useQuery({
    queryKey: KEYS.list(page),
    queryFn: () => notificationService.getNotifications(page, 10),
    enabled,
  });
}

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
