import type { AxiosError } from 'axios';
import apiClient from './client';
import type { Post, PaginatedResponse, CreatePostPayload, UpdatePostPayload } from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export const postService = {
  async getFeed(page = 1, limit = 10): Promise<PaginatedResponse<Post>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Post>>('/posts/feed', {
        params: { page, limit },
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch feed'));
    }
  },

  async getPost(id: string): Promise<Post> {
    try {
      const res = await apiClient.get<Post>(`/posts/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch post'));
    }
  },

  async createPost(payload: CreatePostPayload): Promise<Post> {
    try {
      const res = await apiClient.post<Post>('/posts', payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create post'));
    }
  },

  async updatePost(id: string, payload: UpdatePostPayload): Promise<Post> {
    try {
      const res = await apiClient.patch<Post>(`/posts/${id}`, payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to update post'));
    }
  },

  async deletePost(id: string): Promise<void> {
    try {
      await apiClient.delete(`/posts/${id}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete post'));
    }
  },

  async likePost(id: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const res = await apiClient.post<{ liked: boolean; likesCount: number }>(`/posts/${id}/like`);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to like post'));
    }
  },
};
