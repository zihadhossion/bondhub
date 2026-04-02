import type { AxiosError } from 'axios';
import apiClient from './client';
import type { LoginResponse, RegisterPayload } from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Login failed'));
    }
  },

  async register(payload: RegisterPayload): Promise<LoginResponse> {
    try {
      const res = await apiClient.post<LoginResponse>('/auth/register', payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Registration failed'));
    }
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Logout failed'));
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>('/auth/forgot-password', { email });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to send reset email'));
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>('/auth/reset-password', {
        token,
        newPassword,
      });
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Password reset failed'));
    }
  },
};
