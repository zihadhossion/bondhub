import type { AxiosError } from 'axios';
import apiClient from './client';
import type { Notification, PaginatedResponse } from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export const notificationService = {
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch notifications'));
    }
  },

  async getUnreadCount(): Promise<{ count: number }> {
    try {
      const res = await apiClient.get<{ count: number }>('/notifications/unread-count');
      return res.data;
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

  async markAllAsRead(): Promise<{ message: string }> {
    try {
      const res = await apiClient.patch<{ message: string }>('/notifications/read-all');
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to mark all as read'));
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
