/**
 * Post Zod Schema Tests - F3
 */

import { describe, it, expect } from 'vitest';
import {
  postSchema,
  createPostInputSchema,
  updatePostInputSchema,
  postListSchema,
  commentSchema,
  createCommentInputSchema,
} from '../post';

describe('Post Schema', () => {
  describe('postSchema', () => {
    it('validates a valid post object', () => {
      const validPost = {
        id: 'post-123',
        authorId: 'user-123',
        title: 'Test Post',
        content: 'This is the content',
        excerpt: 'Short excerpt',
        coverImage: 'https://example.com/image.jpg',
        visibility: 'public',
        status: 'published',
        publishedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
        likesCount: 10,
        commentsCount: 5,
        viewsCount: 100,
        isLiked: true,
      };

      const result = postSchema.safeParse(validPost);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test Post');
        expect(result.data.visibility).toBe('public');
      }
    });

    it('validates post with null publishedAt for drafts', () => {
      const draftPost = {
        id: 'post-123',
        authorId: 'user-123',
        title: 'Draft Post',
        content: 'Draft content',
        visibility: 'public',
        status: 'draft',
        publishedAt: null,
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = postSchema.safeParse(draftPost);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.publishedAt).toBeNull();
        expect(result.data.status).toBe('draft');
      }
    });

    it('rejects invalid visibility', () => {
      const invalidPost = {
        id: 'post-123',
        authorId: 'user-123',
        title: 'Test Post',
        content: 'Content',
        visibility: 'invalid-visibility',
        status: 'published',
        publishedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = postSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('visibility');
      }
    });

    it('rejects invalid status', () => {
      const invalidPost = {
        id: 'post-123',
        authorId: 'user-123',
        title: 'Test Post',
        content: 'Content',
        visibility: 'public',
        status: 'invalid-status',
        publishedAt: '2024-01-01T00:00:00.000Z',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = postSchema.safeParse(invalidPost);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('status');
      }
    });
  });

  describe('createPostInputSchema', () => {
    it('validates a valid create post input', () => {
      const validInput = {
        title: 'New Post',
        content: 'This is the content of the new post',
        visibility: 'public' as const,
        status: 'draft' as const,
      };

      const result = createPostInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects empty title', () => {
      const invalidInput = {
        title: '',
        content: 'Content',
      };

      const result = createPostInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/title/i);
      }
    });

    it('rejects empty content', () => {
      const invalidInput = {
        title: 'Title',
        content: '',
      };

      const result = createPostInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/content/i);
      }
    });

    it('rejects title longer than 200 characters', () => {
      const invalidInput = {
        title: 'a'.repeat(201),
        content: 'Content',
      };

      const result = createPostInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('uses default values for visibility and status', () => {
      const minimalInput = {
        title: 'Title',
        content: 'Content',
      };

      const result = createPostInputSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.visibility).toBe('public');
        expect(result.data.status).toBe('draft');
      }
    });
  });

  describe('updatePostInputSchema', () => {
    it('validates a partial update', () => {
      const validUpdate = {
        title: 'Updated Title',
      };

      const result = updatePostInputSchema.safeParse(validUpdate);
      expect(result.success).toBe(true);
    });

    it('accepts empty update object', () => {
      const emptyUpdate = {};

      const result = updatePostInputSchema.safeParse(emptyUpdate);
      expect(result.success).toBe(true);
    });
  });

  describe('postListSchema', () => {
    it('validates a valid post list response', () => {
      const validList = {
        data: [
          {
            id: 'post-1',
            authorId: 'user-1',
            title: 'Post 1',
            content: 'Content 1',
            visibility: 'public',
            status: 'published',
            publishedAt: '2024-01-01T00:00:00.000Z',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        pageSize: 10,
        hasMore: false,
      };

      const result = postListSchema.safeParse(validList);
      expect(result.success).toBe(true);
    });
  });

  describe('commentSchema', () => {
    it('validates a valid comment', () => {
      const validComment = {
        id: 'comment-123',
        postId: 'post-123',
        authorId: 'user-123',
        content: 'Great post!',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = commentSchema.safeParse(validComment);
      expect(result.success).toBe(true);
    });
  });

  describe('createCommentInputSchema', () => {
    it('validates a valid comment input', () => {
      const validInput = {
        postId: 'post-123',
        content: 'Nice post!',
      };

      const result = createCommentInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects empty content', () => {
      const invalidInput = {
        postId: 'post-123',
        content: '',
      };

      const result = createCommentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });

    it('rejects content longer than 1000 characters', () => {
      const invalidInput = {
        postId: 'post-123',
        content: 'a'.repeat(1001),
      };

      const result = createCommentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
