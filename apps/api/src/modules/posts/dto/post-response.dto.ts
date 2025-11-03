import { Post, Media } from '@prisma/client';

export type PostWithMedia = Post & {
  media: Media[];
};

export interface PaginatedPostsResponse {
  posts: PostWithMedia[];
  total: number;
  page: number;
  limit: number;
}
