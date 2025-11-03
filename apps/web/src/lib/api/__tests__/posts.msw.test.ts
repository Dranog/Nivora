/**
 * Posts API MSW Tests - F3
 * Tests success, 401 unauthorized, and 422 validation errors
 */

import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import * as postsApi from '../posts';
import type { Post, PostList } from '@/types/post';

// Mock API responses
const mockPost: Post = {
  id: 'post-123',
  authorId: 'user-123',
  title: 'Test Post',
  content: 'This is test content',
  excerpt: 'Test excerpt',
  visibility: 'public',
  status: 'published',
  publishedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  likesCount: 0,
  commentsCount: 0,
  viewsCount: 0,
};

const mockPostList: PostList = {
  data: [mockPost],
  total: 1,
  page: 1,
  pageSize: 10,
};

// MSW server setup
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Posts API with MSW', () => {
  describe('GET /posts - Success', () => {
    it('fetches posts successfully', async () => {
      server.use(
        http.get('http://localhost:3001/api/posts', () => {
          return HttpResponse.json(mockPostList);
        })
      );

      const result = await postsApi.getPosts();

      expect(result).toEqual(mockPostList);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].title).toBe('Test Post');
    });

    it('fetches single post successfully', async () => {
      server.use(
        http.get('http://localhost:3001/api/posts/:id', ({ params }) => {
          const { id } = params;
          if (id === 'post-123') {
            return HttpResponse.json(mockPost);
          }
          return new HttpResponse(null, { status: 404 });
        })
      );

      const result = await postsApi.getPost('post-123');

      expect(result).toEqual(mockPost);
      expect(result.id).toBe('post-123');
    });
  });

  describe('GET /posts - 401 Unauthorized', () => {
    it('throws error on 401 unauthorized', async () => {
      server.use(
        http.get('http://localhost:3001/api/posts', () => {
          return new HttpResponse(
            JSON.stringify({ message: 'Unauthorized' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );

      await expect(postsApi.getPosts()).rejects.toThrow();
    });

    it('handles 401 on protected post fetch', async () => {
      server.use(
        http.get('http://localhost:3001/api/posts/:id', () => {
          return new HttpResponse(
            JSON.stringify({ message: 'Session expired' }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );

      await expect(postsApi.getPost('post-private-123')).rejects.toThrow();
    });
  });

  describe('POST /posts - Validation Errors (422)', () => {
    it('returns 422 validation error for empty title', async () => {
      server.use(
        http.post('http://localhost:3001/api/posts', async () => {
          return new HttpResponse(
            JSON.stringify({
              message: 'Validation failed',
              errors: {
                title: ['Title is required'],
              },
            }),
            {
              status: 422,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );

      const invalidInput = {
        title: '',
        content: 'Content',
      };

      await expect(postsApi.createPost(invalidInput)).rejects.toThrow();
    });

    it('returns 422 validation error for empty content', async () => {
      server.use(
        http.post('http://localhost:3001/api/posts', async () => {
          return new HttpResponse(
            JSON.stringify({
              message: 'Validation failed',
              errors: {
                content: ['Content is required'],
              },
            }),
            {
              status: 422,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );

      const invalidInput = {
        title: 'Title',
        content: '',
      };

      await expect(postsApi.createPost(invalidInput)).rejects.toThrow();
    });

    it('returns 422 validation error for title too long', async () => {
      server.use(
        http.post('http://localhost:3001/api/posts', async () => {
          return new HttpResponse(
            JSON.stringify({
              message: 'Validation failed',
              errors: {
                title: ['Title must be less than 200 characters'],
              },
            }),
            {
              status: 422,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );

      const invalidInput = {
        title: 'a'.repeat(201),
        content: 'Content',
      };

      await expect(postsApi.createPost(invalidInput)).rejects.toThrow();
    });

    it('returns 422 validation error for multiple fields', async () => {
      server.use(
        http.post('http://localhost:3001/api/posts', async () => {
          return new HttpResponse(
            JSON.stringify({
              message: 'Validation failed',
              errors: {
                title: ['Title is required'],
                content: ['Content is required'],
                visibility: ['Invalid visibility value'],
              },
            }),
            {
              status: 422,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );

      const invalidInput = {
        title: '',
        content: '',
      };

      await expect(postsApi.createPost(invalidInput)).rejects.toThrow();
    });
  });

  describe('POST /posts - Success', () => {
    it('creates post successfully', async () => {
      const newPost = { ...mockPost, id: 'post-new-456' };

      server.use(
        http.post('http://localhost:3001/api/posts', async () => {
          return HttpResponse.json(newPost, { status: 201 });
        })
      );

      const validInput = {
        title: 'New Post',
        content: 'New content',
      };

      const result = await postsApi.createPost(validInput);

      expect(result.id).toBe('post-new-456');
      expect(result.title).toBeDefined();
    });
  });

  describe('PATCH /posts/:id - Success', () => {
    it('updates post successfully', async () => {
      const updatedPost = { ...mockPost, title: 'Updated Title' };

      server.use(
        http.patch('http://localhost:3001/api/posts/:id', async () => {
          return HttpResponse.json(updatedPost);
        })
      );

      const result = await postsApi.updatePost('post-123', {
        title: 'Updated Title',
      });

      expect(result.title).toBe('Updated Title');
    });
  });

  describe('DELETE /posts/:id - Success', () => {
    it('deletes post successfully', async () => {
      server.use(
        http.delete('http://localhost:3001/api/posts/:id', () => {
          return new HttpResponse(null, { status: 204 });
        })
      );

      await expect(postsApi.deletePost('post-123')).resolves.not.toThrow();
    });
  });
});
