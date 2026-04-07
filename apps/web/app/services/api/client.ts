import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;

// Unwrap { success: true, data: T } envelope from TransformInterceptor
// For paginated responses: { success, data: T[], meta: {...} } → { data: T[], total, page, meta }
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      response.data.success === true &&
      'data' in response.data
    ) {
      if ('meta' in response.data && response.data.meta) {
        const meta = response.data.meta as { page?: number; totalItems?: number; limit?: number; totalPages?: number };
        response.data = {
          data: response.data.data,
          total: meta.totalItems ?? 0,
          page: meta.page ?? 1,
          meta,
        };
      } else {
        response.data = response.data.data;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._isRetry) {
      if (isRefreshing) {
        return Promise.reject(error);
      }
      originalRequest._isRetry = true;
      isRefreshing = true;

      try {
        await apiClient.post('/auth/refresh');
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch {
        isRefreshing = false;
        const publicPaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
        const isPublicPage = publicPaths.some((p) => window.location.pathname.startsWith(p));
        if (!isPublicPage) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
