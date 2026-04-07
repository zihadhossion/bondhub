import type { AxiosError } from 'axios';
import apiClient from './client';

export interface CategoryResponse {
  id: string;
  name: string;
  slug: string;
  description?: string;
  communitiesCount: number;
}

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export const categoryService = {
  async getCategories(): Promise<CategoryResponse[]> {
    try {
      const res = await apiClient.get<CategoryResponse[]>('/categories');
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to fetch categories'));
    }
  },
};
