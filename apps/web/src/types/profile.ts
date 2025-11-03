/**
 * Profile Types - F3 Zod Schemas
 */

import { z } from 'zod';

// Social links
export const socialLinksSchema = z.object({
  twitter: z.string().url().optional(),
  instagram: z.string().url().optional(),
  youtube: z.string().url().optional(),
  tiktok: z.string().url().optional(),
  website: z.string().url().optional(),
});

export type SocialLinks = z.infer<typeof socialLinksSchema>;

// Creator profile schema
export const creatorProfileSchema = z.object({
  id: z.string(),
  userId: z.string(),
  displayName: z.string(),
  username: z.string(),
  bio: z.string().optional(),
  avatar: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  category: z.string().optional(),
  socialLinks: socialLinksSchema.optional(),
  isVerified: z.boolean().default(false),
  followerCount: z.number().default(0),
  subscriberCount: z.number().default(0),
  postCount: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type CreatorProfile = z.infer<typeof creatorProfileSchema>;

// Update profile input
export const updateProfileInputSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  bio: z.string().max(500).optional(),
  avatar: z.string().url().optional(),
  coverImage: z.string().url().optional(),
  category: z.string().optional(),
  socialLinks: socialLinksSchema.optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileInputSchema>;

// Profile list response
export const profileListSchema = z.object({
  data: z.array(creatorProfileSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type ProfileList = z.infer<typeof profileListSchema>;
