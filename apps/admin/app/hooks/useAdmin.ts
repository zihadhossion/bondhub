import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/api/admin.service';
import type { AdminListParams } from '../services/api/admin.service';
import type {
  AdminUpdateUserStatusPayload,
  AdminUpdateCommunityStatusPayload,
  AdminCreateCategoryPayload,
  AdminUpdateCategoryPayload,
} from '../types';

// Dashboard
export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: () => adminService.getDashboardStats(),
  });
}

export function useAdminDashboardCharts(period = '7d') {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'charts', period],
    queryFn: () => adminService.getDashboardCharts(period),
  });
}

export function useAdminRecentActivity(limit = 10) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'activity', limit],
    queryFn: () => adminService.getRecentActivity(limit),
  });
}

// Users
export function useAdminUsers(params: AdminListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminService.getUsers(params),
  });
}

export function useAdminUser(id: string) {
  return useQuery({
    queryKey: ['admin', 'users', id],
    queryFn: () => adminService.getUserById(id),
    enabled: !!id,
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateUserStatusPayload }) =>
      adminService.updateUserStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  });
}

export function useDeleteAdminUser() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      navigate('/users');
    },
  });
}

// Communities
export function useAdminCommunities(params: AdminListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'communities', params],
    queryFn: () => adminService.getCommunities(params),
  });
}

export function useAdminCommunity(id: string) {
  return useQuery({
    queryKey: ['admin', 'communities', id],
    queryFn: () => adminService.getCommunityById(id),
    enabled: !!id,
  });
}

export function useUpdateCommunityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateCommunityStatusPayload }) =>
      adminService.updateCommunityStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'communities'] });
    },
  });
}

export function useCreateAdminCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; categoryId: string; description?: string }) =>
      adminService.createCommunity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'communities'] });
    },
  });
}

export function useDeleteAdminCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteCommunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'communities'] });
    },
  });
}

// Categories
export function useAdminCategories(params: AdminListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'categories', params],
    queryFn: () => adminService.getCategories(params),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminCreateCategoryPayload) => adminService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminUpdateCategoryPayload }) =>
      adminService.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] });
    },
  });
}

// Posts
export function useAdminPosts(params: AdminListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'posts', params],
    queryFn: () => adminService.getPosts(params),
  });
}

export function useAdminPost(id: string) {
  return useQuery({
    queryKey: ['admin', 'posts', id],
    queryFn: () => adminService.getPostById(id),
    enabled: !!id,
  });
}

export function useDeleteAdminPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'posts'] });
      navigate('/posts');
    },
  });
}

// Comments
export function useAdminComments(params: AdminListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'comments', params],
    queryFn: () => adminService.getComments(params),
  });
}

export function useDeleteAdminComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.deleteComment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'comments'] });
    },
  });
}

// Flags
export function useAdminFlags(params: AdminListParams = {}) {
  return useQuery({
    queryKey: ['admin', 'flags', params],
    queryFn: () => adminService.getFlags(params),
  });
}

export function useAdminFlag(id: string) {
  return useQuery({
    queryKey: ['admin', 'flags', id],
    queryFn: () => adminService.getFlagById(id),
    enabled: !!id,
  });
}

export function useResolveFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.resolveFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] });
    },
  });
}

export function useDismissFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminService.dismissFlag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] });
    },
  });
}

export function useBulkFlagAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, ids }: { action: 'delete_content' | 'dismiss' | 'suspend_user'; ids: string[] }) =>
      adminService.bulkFlagAction(action, ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] });
    },
  });
}
