import type { AxiosError } from 'axios';
import apiClient from './client';
import type { User, LoginPayload } from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export const authService = {
  async login(payload: LoginPayload): Promise<User> {
    try {
      const res = await apiClient.post<User>('/auth/login', payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Login failed'));
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Logout failed'));
    }
  },
};
