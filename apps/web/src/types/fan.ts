/**
 * Fan Types - F3 Zod Schemas
 */

import { z } from 'zod';

// Fan relationship status
export const fanRelationshipStatusSchema = z.enum(['following', 'subscribed', 'blocked']);
export type FanRelationshipStatus = z.infer<typeof fanRelationshipStatusSchema>;

// Fan schema
export const fanSchema = z.object({
  id: z.string(),
  userId: z.string(),
  creatorId: z.string(),
  status: fanRelationshipStatusSchema,
  followedAt: z.string().datetime().optional(),
  subscribedAt: z.string().datetime().optional(),
  subscriptionEndsAt: z.string().datetime().optional(),
  lifetimeValue: z.number().default(0), // total spent in cents
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Fan = z.infer<typeof fanSchema>;

// Fan with user details
export const fanWithUserSchema = fanSchema.extend({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    displayName: z.string().optional(),
    avatar: z.string().url().optional(),
  }),
});

export type FanWithUser = z.infer<typeof fanWithUserSchema>;

// Follow creator input
export const followCreatorInputSchema = z.object({
  creatorId: z.string(),
});

export type FollowCreatorInput = z.infer<typeof followCreatorInputSchema>;

// Fan list response
export const fanListSchema = z.object({
  data: z.array(fanWithUserSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type FanList = z.infer<typeof fanListSchema>;

// Fan stats
export const fanStatsSchema = z.object({
  totalFans: z.number(),
  activeSubscribers: z.number(),
  totalRevenue: z.number(), // in cents
  averageLifetimeValue: z.number(), // in cents
});

export type FanStats = z.infer<typeof fanStatsSchema>;
