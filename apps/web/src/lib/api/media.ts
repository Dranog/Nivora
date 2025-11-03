/**
 * Media API - F3 Upload/Delete + Query Keys
 */

import { httpClient } from '@/lib/http';
import {
  type Media,
  type UploadMediaResponse,
  type MediaList,
  mediaSchema,
  uploadMediaResponseSchema,
  mediaListSchema,
} from '@/types/media';

// Query keys
export const mediaKeys = {
  all: ['media'] as const,
  lists: () => [...mediaKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...mediaKeys.lists(), filters] as const,
  details: () => [...mediaKeys.all, 'detail'] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
  byPost: (postId: string) => [...mediaKeys.all, 'byPost', postId] as const,
};

// Get media list
export async function getMedia(params?: {
  page?: number;
  pageSize?: number;
  type?: string;
}): Promise<MediaList> {
  const response = await httpClient.get<MediaList>('/media', { params });
  return mediaListSchema.parse(response.data);
}

// Get media by ID
export async function getMediaById(id: string): Promise<Media> {
  const response = await httpClient.get<Media>(`/media/${id}`);
  return mediaSchema.parse(response.data);
}

// Upload media
export async function uploadMedia(file: File, postId?: string): Promise<UploadMediaResponse> {
  const formData = new FormData();
  formData.append('file', file);
  if (postId) {
    formData.append('postId', postId);
  }

  const response = await httpClient.post<UploadMediaResponse>('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return uploadMediaResponseSchema.parse(response.data);
}

// Delete media
export async function deleteMedia(id: string): Promise<void> {
  await httpClient.delete<void>(`/media/${id}`);
}
