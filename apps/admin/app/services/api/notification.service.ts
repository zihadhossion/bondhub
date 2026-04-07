import apiClient from './client';
import type { Notification, PaginatedNotifications } from '../../types';

function extractErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
  ) {
    return String((error.response.data as { message: unknown }).message);
  }
  return fallback;
}

const notificationService = {
  async getNotifications(page = 1, limit = 10): Promise<PaginatedNotifications> {
    try {
      const res = await apiClient.get<PaginatedNotifications>('/notifications', {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch notifications'));
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await apiClient.get<{ count: number }>('/notifications/unread-count');
      return res.data.count;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch unread count'));
    }
  },

  async markAsRead(id: string): Promise<Notification> {
    try {
      const res = await apiClient.patch<Notification>(`/notifications/${id}/read`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to mark notification as read'));
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch('/notifications/read-all');
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to mark all notifications as read'));
    }
  },

  async deleteNotification(id: string): Promise<void> {
    try {
      await apiClient.delete(`/notifications/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete notification'));
    }
  },
};

export default notificationService;
