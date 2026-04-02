import type { AxiosError } from 'axios';
import apiClient from './client';
import type { User } from '../../types';

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
};
