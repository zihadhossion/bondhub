import type { AxiosError } from 'axios';
import apiClient from './client';
import type { CreateFlagPayload } from '../../types';

function extractErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  const axiosErr = error as AxiosError<{ message: string }>;
  return axiosErr.response?.data?.message ?? fallback;
}

export const flagService = {
  async createFlag(payload: CreateFlagPayload): Promise<{ message: string }> {
    try {
      const res = await apiClient.post<{ message: string }>('/flags', payload);
      return res.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Failed to report content'));
    }
  },
};
