import type { AxiosError } from 'axios';
import apiClient from './client';
import type { Comment, PaginatedResponse, CreateCommentPayload } from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export const commentService = {
  async getComments(postId: string, page = 1, limit = 20): Promise<PaginatedResponse<Comment>> {
    try {
      const res = await apiClient.get<PaginatedResponse<Comment>>(
        `/posts/${postId}/comments`,
        { params: { page, limit } },
      );
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch comments'));
    }
  },

  async createComment(postId: string, payload: CreateCommentPayload): Promise<Comment> {
    try {
      const res = await apiClient.post<Comment>(`/posts/${postId}/comments`, payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to create comment'));
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/comments/${commentId}`);
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to delete comment'));
    }
  },
};
