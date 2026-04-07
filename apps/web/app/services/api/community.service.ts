import type { AxiosError } from 'axios';
import apiClient from './client';
import type { Community, Post, User, PaginatedResponse } from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export interface GetCommunitiesParams {
  q?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const communityService = {
  async getCommunities(params: GetCommunitiesParams = {}): Promise<PaginatedResponse<Community>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Community>>('/communities', { params });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch communities'));
    }
  },

  async getCommunity(id: string): Promise<Community> {
    try {
      const res = await apiClient.get<Community>(`/communities/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch community'));
    }
  },

  async joinCommunity(id: string): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>(`/communities/${id}/join`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to join community'));
    }
  },

  async leaveCommunity(id: string): Promise<{ message: string }> {
    try {
      const res = await apiClient.delete<{ message: string }>(`/communities/${id}/join`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to leave community'));
    }
  },

  async getCommunityPosts(id: string, page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Post>>(`/communities/${id}/posts`, {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch community posts'));
    }
  },

  async getCommunityMembers(id: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    try {
      const res = await apiClient.get<PaginatedResponse<User>>(`/communities/${id}/members`, {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch community members'));
    }
  },
};
