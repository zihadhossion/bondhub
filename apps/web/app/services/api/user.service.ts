import type { AxiosError } from 'axios';
import apiClient from './client';
import type { User, Post, PaginatedResponse, UpdateProfilePayload, ChangePasswordPayload } from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export const userService = {
  async getMe(): Promise<User> {
    try {
      const res = await apiClient.get<User>('/users/me');
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch profile'));
    }
  },

  async updateMe(payload: UpdateProfilePayload): Promise<User> {
    try {
      const res = await apiClient.patch<User>('/users/me', payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update profile'));
    }
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await apiClient.post<{ avatarUrl: string }>('/users/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to upload avatar'));
    }
  },

  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    try {
      const res = await apiClient.patch<{ message: string }>('/users/me/password', payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to change password'));
    }
  },

  async getProfile(userId: string): Promise<User> {
    try {
      const res = await apiClient.get<User>(`/users/${userId}`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch user profile'));
    }
  },

  async getUserPosts(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<Post>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Post>>(`/users/${userId}/posts`, {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch user posts'));
    }
  },

  async followUser(userId: string): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>(`/users/${userId}/follow`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to follow user'));
    }
  },

  async unfollowUser(userId: string): Promise<{ message: string }> {
    try {
      const res = await apiClient.delete<{ message: string }>(`/users/${userId}/follow`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to unfollow user'));
    }
  },

  async getFollowers(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    try {
      const res = await apiClient.get<PaginatedResponse<User>>(`/users/${userId}/followers`, {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch followers'));
    }
  },

  async getFollowing(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    try {
      const res = await apiClient.get<PaginatedResponse<User>>(`/users/${userId}/following`, {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch following'));
    }
  },
};
