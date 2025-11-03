/**
 * Post Types - F3 Zod Schemas
 */

import { z } from 'zod';

// Post visibility
export const postVisibilitySchema = z.enum(['public', 'followers', 'subscribers', 'private']);
export type PostVisibility = z.infer<typeof postVisibilitySchema>;

// Post status
export const postStatusSchema = z.enum(['draft', 'published', 'archived']);
export type PostStatus = z.infer<typeof postStatusSchema>;

// Media type
export const mediaTypeSchema = z.enum(['image', 'video', 'none']);
export type MediaType = z.infer<typeof mediaTypeSchema>;

// Post base schema
export const postSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  title: z.string(),
  content: z.string(),
  excerpt: z.string().optional(),
  coverImage: z.string().url().optional(),
  visibility: postVisibilitySchema,
  status: postStatusSchema,
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  likesCount: z.number().default(0),
  commentsCount: z.number().default(0),
  viewsCount: z.number().default(0),
  isLiked: z.boolean().optional(),
  // F5 Protection fields
  isPaid: z.boolean().default(false),
  price: z.number().optional(),
  locked: z.boolean().default(false),
  mediaUrl: z.string().url().optional(),
  mediaType: mediaTypeSchema.default('none'),
});

export type Post = z.infer<typeof postSchema>;

// Create post input
export const createPostInputSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  visibility: postVisibilitySchema.default('public'),
  status: postStatusSchema.default('draft'),
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

// Update post input
export const updatePostInputSchema = createPostInputSchema.partial();
export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

// Post list response
export const postListSchema = z.object({
  data: z.array(postSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  hasMore: z.boolean().optional(),
});

export type PostList = z.infer<typeof postListSchema>;

// Post comment
export const commentSchema = z.object({
  id: z.string(),
  postId: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Comment = z.infer<typeof commentSchema>;

// Create comment input
export const createCommentInputSchema = z.object({
  postId: z.string(),
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;
