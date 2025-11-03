/**
 * Offer Types - F3 Zod Schemas
 */

import { z } from 'zod';

// Offer type
export const offerTypeSchema = z.enum(['subscription', 'one_time', 'bundle']);
export type OfferType = z.infer<typeof offerTypeSchema>;

// Billing interval
export const billingIntervalSchema = z.enum(['month', 'year']);
export type BillingInterval = z.infer<typeof billingIntervalSchema>;

// Offer schema
export const offerSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  type: offerTypeSchema,
  name: z.string(),
  description: z.string(),
  price: z.number(), // in cents
  currency: z.string().default('USD'),
  billingInterval: billingIntervalSchema.optional(),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  subscriberCount: z.number().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Offer = z.infer<typeof offerSchema>;

// Create offer input
export const createOfferInputSchema = z.object({
  type: offerTypeSchema,
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().min(1, 'Description is required').max(1000),
  price: z.number().min(0, 'Price must be positive'),
  currency: z.string().default('USD'),
  billingInterval: billingIntervalSchema.optional(),
  features: z.array(z.string()).default([]),
});

export type CreateOfferInput = z.infer<typeof createOfferInputSchema>;

// Update offer input
export const updateOfferInputSchema = createOfferInputSchema.partial();
export type UpdateOfferInput = z.infer<typeof updateOfferInputSchema>;

// Offer list response
export const offerListSchema = z.object({
  data: z.array(offerSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type OfferList = z.infer<typeof offerListSchema>;

// Subscription schema
export const subscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  offerId: z.string(),
  status: z.enum(['active', 'canceled', 'past_due', 'expired']),
  currentPeriodStart: z.string().datetime(),
  currentPeriodEnd: z.string().datetime(),
  cancelAtPeriodEnd: z.boolean().default(false),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Subscription = z.infer<typeof subscriptionSchema>;
