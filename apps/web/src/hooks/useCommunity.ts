import { useOptimistic, useTransition } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityService } from '../services/api/community.service';
import type { GetCommunitiesParams } from '../services/api/community.service';

export function useCommunities(params: GetCommunitiesParams = {}) {
  return useQuery({
    queryKey: ['communities', params],
    queryFn: () => communityService.getCommunities(params),
  });
}

export function useCommunity(id: string) {
  return useQuery({
    queryKey: ['communities', id],
    queryFn: () => communityService.getCommunity(id),
    enabled: !!id,
  });
}

export function useCommunityPosts(id: string, page = 1) {
  return useQuery({
    queryKey: ['communities', id, 'posts', page],
    queryFn: () => communityService.getCommunityPosts(id, page),
    enabled: !!id,
  });
}

export function useCommunityMembers(id: string, page = 1) {
  return useQuery({
    queryKey: ['communities', id, 'members', page],
    queryFn: () => communityService.getCommunityMembers(id, page),
    enabled: !!id,
  });
}

export function useJoinCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communityService.joinCommunity(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['communities', id] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useLeaveCommunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => communityService.leaveCommunity(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: ['communities', id] });
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
}

export function useJoinOptimistic(communityId: string, isMember: boolean) {
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  const join = useMutation({ mutationFn: () => communityService.joinCommunity(communityId) });
  const leave = useMutation({ mutationFn: () => communityService.leaveCommunity(communityId) });

  const [optimisticMember, addOptimistic] = useOptimistic(
    isMember,
    (_current, next: boolean) => next,
  );

  const toggleMembership = () => {
    startTransition(async () => {
      addOptimistic(!isMember);
      if (isMember) {
        await leave.mutateAsync();
      } else {
        await join.mutateAsync();
      }
      queryClient.invalidateQueries({ queryKey: ['communities', communityId] });
    });
  };

  return { optimisticMember, toggleMembership, isPending };
}
