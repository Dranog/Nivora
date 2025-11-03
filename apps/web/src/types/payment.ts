/**
 * Payment Types - F3 Zod Schemas
 */

import { z } from 'zod';

// Payment status
export const paymentStatusSchema = z.enum([
  'pending',
  'processing',
  'succeeded',
  'failed',
  'canceled',
  'refunded',
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

// Payment method type
export const paymentMethodTypeSchema = z.enum(['card', 'bank_account', 'wallet']);
export type PaymentMethodType = z.infer<typeof paymentMethodTypeSchema>;

// Payment schema
export const paymentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(), // in cents
  currency: z.string().default('USD'),
  status: paymentStatusSchema,
  paymentMethod: paymentMethodTypeSchema,
  description: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
});

export type Payment = z.infer<typeof paymentSchema>;

// Checkout session input
export const checkoutSessionInputSchema = z.object({
  offerId: z.string(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type CheckoutSessionInput = z.infer<typeof checkoutSessionInputSchema>;

// Checkout session response
export const checkoutSessionResponseSchema = z.object({
  sessionId: z.string(),
  checkoutUrl: z.string().url(),
  expiresAt: z.string().datetime(),
});

export type CheckoutSessionResponse = z.infer<typeof checkoutSessionResponseSchema>;

// Payment intent input
export const paymentIntentInputSchema = z.object({
  amount: z.number().min(50, 'Minimum amount is $0.50'), // in cents
  currency: z.string().default('USD'),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type PaymentIntentInput = z.infer<typeof paymentIntentInputSchema>;

// Payment intent response
export const paymentIntentResponseSchema = z.object({
  id: z.string(),
  clientSecret: z.string(),
  amount: z.number(),
  currency: z.string(),
  status: paymentStatusSchema,
});

export type PaymentIntentResponse = z.infer<typeof paymentIntentResponseSchema>;

// Payment history response
export const paymentHistorySchema = z.object({
  data: z.array(paymentSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type PaymentHistory = z.infer<typeof paymentHistorySchema>;
