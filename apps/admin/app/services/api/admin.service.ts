import type { AxiosError } from 'axios';
import apiClient from './client';
import type {
  User,
  Community,
  Post,
  Comment,
  Flag,
  Category,
  PaginatedResponse,
  DashboardStats,
  ChartData,
  RecentActivityItem,
  AdminUpdateUserStatusPayload,
  AdminUpdateCommunityStatusPayload,
  AdminCreateCategoryPayload,
  AdminUpdateCategoryPayload,
} from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export const adminService = {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const res = await apiClient.get<DashboardStats>('/admin/dashboard/stats');
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch dashboard stats'));
    }
  },

  async getDashboardCharts(period = 'week'): Promise<ChartData> {
    try {
      const res = await apiClient.get<ChartData>('/admin/dashboard/charts', {
        params: { period },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch chart data'));
    }
  },

  async getRecentActivity(limit = 10): Promise<RecentActivityItem[]> {
    try {
      const res = await apiClient.get<RecentActivityItem[]>('/admin/dashboard/recent-activity', {
        params: { limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch recent activity'));
    }
  },

  // Users
  async getUsers(params: AdminListParams = {}): Promise<PaginatedResponse<User>> {
    try {
      const res = await apiClient.get<PaginatedResponse<User>>('/admin/users', { params });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch users'));
    }
  },

  async getUserById(id: string): Promise<User> {
    try {
      const res = await apiClient.get<User>(`/admin/users/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch user'));
    }
  },

  async updateUserStatus(id: string, payload: AdminUpdateUserStatusPayload): Promise<User> {
    try {
      const res = await apiClient.patch<User>(`/admin/users/${id}/status`, payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update user status'));
    }
  },

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/users/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete user'));
    }
  },

  // Communities
  async getCommunities(params: AdminListParams = {}): Promise<PaginatedResponse<Community>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Community>>('/admin/communities', { params });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch communities'));
    }
  },

  async getCommunityById(id: string): Promise<Community> {
    try {
      const res = await apiClient.get<Community>(`/admin/communities/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch community'));
    }
  },

  async updateCommunityStatus(
    id: string,
    payload: AdminUpdateCommunityStatusPayload,
  ): Promise<Community> {
    try {
      const res = await apiClient.patch<Community>(`/admin/communities/${id}/status`, payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update community status'));
    }
  },

  async createCommunity(payload: { name: string; categoryId: string; description?: string }): Promise<Community> {
    try {
      const res = await apiClient.post<Community>('/admin/communities', payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create community'));
    }
  },

  async deleteCommunity(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/communities/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete community'));
    }
  },

  // Categories
  async getCategories(params: AdminListParams = {}): Promise<PaginatedResponse<Category>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Category>>('/admin/categories', { params });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch categories'));
    }
  },

  async createCategory(payload: AdminCreateCategoryPayload): Promise<Category> {
    try {
      const res = await apiClient.post<Category>('/admin/categories', payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create category'));
    }
  },

  async updateCategory(id: string, payload: AdminUpdateCategoryPayload): Promise<Category> {
    try {
      const res = await apiClient.patch<Category>(`/admin/categories/${id}`, payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update category'));
    }
  },

  async deleteCategory(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/categories/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete category'));
    }
  },

  // Posts
  async getPosts(params: AdminListParams = {}): Promise<PaginatedResponse<Post>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Post>>('/admin/posts', { params });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch posts'));
    }
  },

  async getPostById(id: string): Promise<Post> {
    try {
      const res = await apiClient.get<Post>(`/admin/posts/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch post'));
    }
  },

  async deletePost(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/posts/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete post'));
    }
  },

  // Comments
  async getComments(params: AdminListParams = {}): Promise<PaginatedResponse<Comment>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Comment>>('/admin/comments', { params });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch comments'));
    }
  },

  async deleteComment(id: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/comments/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete comment'));
    }
  },

  // Flags
  async getFlags(params: AdminListParams = {}): Promise<PaginatedResponse<Flag>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Flag>>('/admin/flags', { params });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch flags'));
    }
  },

  async getFlagById(id: string): Promise<Flag> {
    try {
      const res = await apiClient.get<Flag>(`/admin/flags/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch flag'));
    }
  },

  async resolveFlag(id: string): Promise<Flag> {
    try {
      const res = await apiClient.patch<Flag>(`/admin/flags/${id}/resolve`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to resolve flag'));
    }
  },

  async dismissFlag(id: string): Promise<Flag> {
    try {
      const res = await apiClient.patch<Flag>(`/admin/flags/${id}/dismiss`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to dismiss flag'));
    }
  },

  async bulkFlagAction(action: 'delete_content' | 'dismiss' | 'suspend_user', ids: string[]): Promise<void> {
    try {
      await apiClient.post('/admin/flags/bulk', { action, ids });
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to perform bulk action'));
    }
  },

  // Export — returns URL string; use window.location.href to trigger download
  exportCsvUrl(entity: 'users' | 'communities' | 'posts'): string {
    const base = import.meta.env.VITE_API_URL ?? '/api';
    return `${base}/admin/export?entity=${entity}`;
  },
};
