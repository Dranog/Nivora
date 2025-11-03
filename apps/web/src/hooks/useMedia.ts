/**
 * Media Hooks - F3 React Query
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as mediaApi from '@/lib/api/media';
import { mediaKeys } from '@/lib/api/media';
import type { Media, MediaList, UploadMediaResponse } from '@/types/media';
import { mapErrorToToast } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Get media list
 */
export function useMedia(
  params?: {
    page?: number;
    pageSize?: number;
    type?: string;
  },
  options?: Omit<UseQueryOptions<MediaList, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: mediaKeys.list(params || {}),
    queryFn: () => mediaApi.getMedia(params),
    ...options,
  });
}

/**
 * Get media by ID
 */
export function useMediaById(id: string, options?: Omit<UseQueryOptions<Media, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: () => mediaApi.getMediaById(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Upload media mutation
 */
export function useUploadMedia(options?: UseMutationOptions<UploadMediaResponse, Error, { file: File; postId?: string }>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ file, postId }) => mediaApi.uploadMedia(file, postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });

      toast({
        title: 'Upload successful',
        description: 'Your file has been uploaded',
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
 * Delete media mutation
 */
export function useDeleteMedia(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: mediaApi.deleteMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });

      toast({
        title: 'Media deleted',
        description: 'Your file has been deleted',
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
