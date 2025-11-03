/**
 * CRM Hooks - F3 React Query
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as crmApi from '@/lib/api/crm';
import { crmKeys } from '@/lib/api/crm';
import type { Fan, FanList, FanStats, FollowCreatorInput } from '@/types/fan';
import { mapErrorToToast } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Get fans list
 */
export function useFans(
  params?: {
    page?: number;
    pageSize?: number;
    status?: string;
  },
  options?: Omit<UseQueryOptions<FanList, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: crmKeys.fansList(params || {}),
    queryFn: () => crmApi.getFans(params),
    ...options,
  });
}

/**
 * Get fan by ID
 */
export function useFan(id: string, options?: Omit<UseQueryOptions<Fan, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: crmKeys.fan(id),
    queryFn: () => crmApi.getFan(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Get fan stats
 */
export function useFanStats(options?: Omit<UseQueryOptions<FanStats, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: crmKeys.stats(),
    queryFn: crmApi.getFanStats,
    ...options,
  });
}

/**
 * Follow creator mutation
 */
export function useFollowCreator(options?: UseMutationOptions<Fan, Error, FollowCreatorInput>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: crmApi.followCreator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.fans() });

      toast({
        title: 'Following',
        description: 'You are now following this creator',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Unfollow creator mutation
 */
export function useUnfollowCreator() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: crmApi.unfollowCreator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.fans() });

      toast({
        title: 'Unfollowed',
        description: 'You have unfollowed this creator',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Block fan mutation
 */
export function useBlockFan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: crmApi.blockFan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: crmKeys.fans() });

      toast({
        title: 'Fan blocked',
        description: 'This fan has been blocked',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
  });
}
