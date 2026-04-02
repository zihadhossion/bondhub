import { useOptimistic, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { postService } from '../services/api/post.service';
import type { CreatePostPayload, Post, UpdatePostPayload } from '../types';

export function useFeed(page = 1) {
  return useQuery({
    queryKey: ['feed', page],
    queryFn: () => postService.getFeed(page),
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ['posts', id],
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  });
}

export function useCreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload) => postService.createPost(payload),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      queryClient.invalidateQueries({ queryKey: ['communities', post.community.id, 'posts'] });
      navigate(`/posts/${post.id}`);
    },
  });
}

export function useUpdatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePostPayload }) =>
      postService.updatePost(id, payload),
    onSuccess: (post) => {
      queryClient.invalidateQueries({ queryKey: ['posts', post.id] });
      navigate(`/posts/${post.id}`);
    },
  });
}

export function useDeletePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      navigate('/feed');
    },
  });
}

export function useLikeOptimistic(post: Post) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const { mutateAsync } = useMutation({
    mutationFn: () => postService.likePost(post.id),
    onSuccess: (data) => {
      queryClient.setQueryData<Post>(['posts', post.id], (old) =>
        old ? { ...old, isLiked: data.liked, likesCount: data.likesCount } : old,
      );
    },
  });

  const [optimisticLiked, addOptimistic] = useOptimistic(
    post.isLiked,
    (_current, next: boolean) => next,
  );

  const toggleLike = () => {
    startTransition(async () => {
      addOptimistic(!post.isLiked);
      await mutateAsync();
    });
  };

  return { optimisticLiked, toggleLike, isPending };
}
