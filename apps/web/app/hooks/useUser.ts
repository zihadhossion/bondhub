import { useOptimistic, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/api/user.service';
import { updateUser } from '../store/slices/authSlice';
import { useAppDispatch } from './useAppSelector';
import type { UpdateProfilePayload, ChangePasswordPayload } from '../types';

export function useMyProfile() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => userService.getMe(),
  });
}

export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: ['users', userId],
    queryFn: () => userService.getProfile(userId),
    enabled: !!userId,
  });
}

export function useUserPosts(userId: string, page = 1) {
  return useQuery({
    queryKey: ['users', userId, 'posts', page],
    queryFn: () => userService.getUserPosts(userId, page),
    enabled: !!userId,
  });
}

export function useUpdateProfile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => userService.updateMe(payload),
    onSuccess: (user) => {
      dispatch(updateUser(user));
      queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
      navigate('/profile');
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => userService.changePassword(payload),
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.followUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => userService.unfollowUser(userId),
    onSuccess: (_data, userId) => {
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });
}

export function useFollowOptimistic(userId: string, isFollowing: boolean) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const follow = useMutation({ mutationFn: () => userService.followUser(userId) });
  const unfollow = useMutation({ mutationFn: () => userService.unfollowUser(userId) });

  const [optimisticFollowing, addOptimistic] = useOptimistic(
    isFollowing,
    (_current, next: boolean) => next,
  );

  const toggleFollow = () => {
    startTransition(async () => {
      addOptimistic(!isFollowing);
      if (isFollowing) {
        await unfollow.mutateAsync();
      } else {
        await follow.mutateAsync();
      }
      queryClient.invalidateQueries({ queryKey: ['users', userId] });
    });
  };

  return { optimisticFollowing, toggleFollow, isPending };
}

export function useFollowers(userId: string, page = 1) {
  return useQuery({
    queryKey: ['users', userId, 'followers', page],
    queryFn: () => userService.getFollowers(userId, page),
    enabled: !!userId,
  });
}

export function useFollowing(userId: string, page = 1) {
  return useQuery({
    queryKey: ['users', userId, 'following', page],
    queryFn: () => userService.getFollowing(userId, page),
    enabled: !!userId,
  });
}
