/**
 * Creator Types - F4 Extended Post Types
 */

import { z } from 'zod';
import { createPostInputSchema, updatePostInputSchema } from './post';

// Creator post visibility (extended)
export const creatorPostVisibilitySchema = z.enum(['free', 'subscribers', 'paid']);
export type CreatorPostVisibility = z.infer<typeof creatorPostVisibilitySchema>;

// Creator post input (extended)
export const creatorPostInputSchema = createPostInputSchema.extend({
  visibility: creatorPostVisibilitySchema.default('free'),
  price: z.number().min(50, 'Minimum price is $0.50').optional(), // cents for PPV
  scheduledAt: z.string().datetime().optional(), // ISO datetime for scheduling
  tags: z.array(z.string()).default([]),
  nsfw: z.boolean().default(false),
  coverImageId: z.string().optional(), // Media ID from upload
});

export type CreatorPostInput = z.infer<typeof creatorPostInputSchema>;

// Creator post update input
export const creatorPostUpdateInputSchema = creatorPostInputSchema.partial();
export type CreatorPostUpdateInput = z.infer<typeof creatorPostUpdateInputSchema>;

// Draft state for localStorage
export const draftStateSchema = z.object({
  title: z.string().default(''),
  content: z.string().default(''),
  visibility: creatorPostVisibilitySchema.default('free'),
  price: z.number().optional(),
  scheduledAt: z.string().optional(),
  tags: z.array(z.string()).default([]),
  nsfw: z.boolean().default(false),
  coverImageId: z.string().optional(),
  savedAt: z.string().datetime(), // Last save timestamp
});

export type DraftState = z.infer<typeof draftStateSchema>;

// Post filter options
export const postFilterSchema = z.object({
  status: z.enum(['all', 'published', 'draft', 'scheduled']).default('all'),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type PostFilter = z.infer<typeof postFilterSchema>;
