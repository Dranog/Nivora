/**
 * Posts Hooks - F3 React Query
 */

import { useMutation, useQuery, useQueryClient, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import * as postsApi from '@/lib/api/posts';
import { postsKeys } from '@/lib/api/posts';
import type { Post, PostList, CreatePostInput, UpdatePostInput } from '@/types/post';
import { mapErrorToToast } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Get all posts
 */
export function usePosts(
  params?: {
    page?: number;
    pageSize?: number;
    authorId?: string;
    status?: string;
  },
  options?: Omit<UseQueryOptions<PostList, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: postsKeys.list(params || {}),
    queryFn: () => postsApi.getPosts(params),
    ...options,
  });
}

/**
 * Get post by ID
 */
export function usePost(id: string, options?: Omit<UseQueryOptions<Post, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: postsKeys.detail(id),
    queryFn: () => postsApi.getPost(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create post mutation
 */
export function useCreatePost(options?: UseMutationOptions<Post, Error, CreatePostInput>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: postsApi.createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      toast({
        title: 'Post created',
        description: 'Your post has been created successfully',
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
 * Update post mutation
 */
export function useUpdatePost(options?: UseMutationOptions<Post, Error, { id: string; input: UpdatePostInput }>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }) => postsApi.updatePost(id, input),
    onSuccess: (updatedPost) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.setQueryData(postsKeys.detail(updatedPost.id), updatedPost);

      toast({
        title: 'Post updated',
        description: 'Your post has been updated successfully',
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
 * Delete post mutation
 */
export function useDeletePost(options?: UseMutationOptions<void, Error, string>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: postsApi.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });

      toast({
        title: 'Post deleted',
        description: 'Your post has been deleted successfully',
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
 * Publish post mutation
 */
export function usePublishPost() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: postsApi.publishPost,
    onSuccess: (publishedPost) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
      queryClient.setQueryData(postsKeys.detail(publishedPost.id), publishedPost);

      toast({
        title: 'Post published',
        description: 'Your post is now live',
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
 * Like post mutation
 */
export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.likePost,
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}

/**
 * Unlike post mutation
 */
export function useUnlikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.unlikePost,
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: postsKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postsKeys.lists() });
    },
  });
}
