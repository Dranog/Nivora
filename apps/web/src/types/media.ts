/**
 * Media Types - F3 Zod Schemas + Paid Media Extensions
 */

import { z } from 'zod';

// ============================================
// ORIGINAL MEDIA TYPES (Upload/Management)
// ============================================

// Media type
export const mediaTypeSchema = z.enum(['image', 'video', 'audio', 'document']);
export type MediaType = z.infer<typeof mediaTypeSchema>;

// Media schema
export const mediaSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: mediaTypeSchema,
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  filename: z.string(),
  mimeType: z.string(),
  size: z.number(), // bytes
  width: z.number().optional(),
  height: z.number().optional(),
  duration: z.number().optional(), // seconds for video/audio
  createdAt: z.string().datetime(),
});

export type Media = z.infer<typeof mediaSchema>;

// Upload media input
export const uploadMediaInputSchema = z.object({
  file: z.instanceof(File),
  type: mediaTypeSchema,
  postId: z.string().optional(),
});

export type UploadMediaInput = z.infer<typeof uploadMediaInputSchema>;

// Upload media response
export const uploadMediaResponseSchema = z.object({
  media: mediaSchema,
  uploadUrl: z.string().url().optional(), // For direct uploads
});

export type UploadMediaResponse = z.infer<typeof uploadMediaResponseSchema>;

// Media list response
export const mediaListSchema = z.object({
  data: z.array(mediaSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type MediaList = z.infer<typeof mediaListSchema>;

// ============================================
// PAID MEDIA TYPES (Locked/Unlocked Content)
// ============================================

export type PaidMediaType = 'image' | 'video'
export type PurchaseType = 'media' | 'tip' | 'subscription'
export type PurchaseStatus = 'pending' | 'completed' | 'refunded'

export interface LockedMedia {
  id: string
  type: PaidMediaType
  url: string // URL floué/thumbnail
  blurredUrl: string // URL floué
  fullUrl: string // URL complète (accessible après achat)
  price: number
  currency: 'EUR' | 'USD'
  isVip: boolean
  isPurchased: boolean
  purchasedAt?: Date | string
  creatorId: string
  messageId: string
}

export interface Purchase {
  id: string
  type: PurchaseType
  userId: string // Fan
  creatorId: string
  amount: number
  currency: 'EUR' | 'USD'
  purchasedAt: Date | string

  // Si type = 'media'
  mediaId?: string
  mediaType?: PaidMediaType
  mediaUrl?: string
  mediaThumbnail?: string

  // Si type = 'tip'
  tipMessage?: string

  // Metadata
  status: PurchaseStatus
  stripePaymentId?: string
}
