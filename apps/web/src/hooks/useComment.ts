import { useOptimistic } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { commentService } from '../services/api/comment.service';
import type { Comment, CreateCommentPayload } from '../types';

type CommentAction = { type: 'add'; comment: Comment } | { type: 'remove'; id: string };

export function useOptimisticComments(serverComments: Comment[]) {
  const [optimisticComments, dispatch] = useOptimistic(
    serverComments,
    (current, action: CommentAction) => {
      if (action.type === 'add') return [...current, action.comment];
      if (action.type === 'remove') return current.filter((c) => c.id !== action.id);
      return current;
    },
  );

  return { optimisticComments, dispatch };
}

export function useComments(postId: string, page = 1) {
  return useQuery({
    queryKey: ['posts', postId, 'comments', page],
    queryFn: () => commentService.getComments(postId, page),
    enabled: !!postId,
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, payload }: { postId: string; payload: CreateCommentPayload }) =>
      commentService.createComment(postId, payload),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; postId: string }) =>
      commentService.deleteComment(commentId),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['posts', postId, 'comments'] });
      queryClient.invalidateQueries({ queryKey: ['posts', postId] });
    },
  });
}
