/**
 * Posts API - F3 CRUD + Query Keys
 */

import { http } from '@/lib/http';
import {
  type Post,
  type CreatePostInput,
  type UpdatePostInput,
  type PostList,
  postSchema,
  postListSchema,
  type Comment,
  type CreateCommentInput,
  commentSchema,
} from '@/types/post';

// Query keys
export const postsKeys = {
  all: ['posts'] as const,
  lists: () => [...postsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...postsKeys.lists(), filters] as const,
  details: () => [...postsKeys.all, 'detail'] as const,
  detail: (id: string) => [...postsKeys.details(), id] as const,
  byUser: (userId: string) => [...postsKeys.all, 'byUser', userId] as const,
  comments: (postId: string) => [...postsKeys.all, 'comments', postId] as const,
};

// Get all posts
export async function getPosts(params?: {
  page?: number;
  pageSize?: number;
  authorId?: string;
  status?: string;
}): Promise<PostList> {
  const response = await http.get<PostList>('/posts', { params });
  return postListSchema.parse(response);
}

// Get post by ID
export async function getPost(id: string): Promise<Post> {
  const response = await http.get<Post>(`/posts/${id}`);
  return postSchema.parse(response);
}

// Create post
export async function createPost(input: CreatePostInput): Promise<Post> {
  const response = await http.post<Post>('/posts', input);
  return postSchema.parse(response);
}

// Update post
export async function updatePost(id: string, input: UpdatePostInput): Promise<Post> {
  const response = await http.patch<Post>(`/posts/${id}`, input);
  return postSchema.parse(response);
}

// Delete post
export async function deletePost(id: string): Promise<void> {
  await http.delete<void>(`/posts/${id}`);
}

// Publish post
export async function publishPost(id: string): Promise<Post> {
  const response = await http.post<Post>(`/posts/${id}/publish`);
  return postSchema.parse(response);
}

// Like post
export async function likePost(id: string): Promise<void> {
  await http.post<void>(`/posts/${id}/like`);
}

// Unlike post
export async function unlikePost(id: string): Promise<void> {
  await http.delete<void>(`/posts/${id}/like`);
}

// Get comments
export async function getComments(postId: string): Promise<Comment[]> {
  const response = await http.get<Comment[]>(`/posts/${postId}/comments`);
  return response.map((c) => commentSchema.parse(c));
}

// Create comment
export async function createComment(input: CreateCommentInput): Promise<Comment> {
  const response = await http.post<Comment>(`/posts/${input.postId}/comments`, input);
  return commentSchema.parse(response);
}

// Delete comment
export async function deleteComment(postId: string, commentId: string): Promise<void> {
  await http.delete<void>(`/posts/${postId}/comments/${commentId}`);
}

/**
 * Get current user's posts
 * Stub implementation - uses getPosts with current user filter
 */
export async function listMine(): Promise<PostList> {
  // TODO: Get current user ID from auth context
  return getPosts({ status: 'published' });
}
