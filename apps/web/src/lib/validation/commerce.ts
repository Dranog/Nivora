/**
 * Commerce Validation Schemas (Zod)
 */

import { z } from 'zod';

export const purchaseTypeSchema = z.enum(['subscription', 'ppv', 'tip']);

export const transactionStatusSchema = z.enum(['pending', 'completed', 'failed', 'refunded']);

export const purchaseIntentSchema = z.object({
  type: purchaseTypeSchema,
  itemId: z.string().min(1, 'Item ID is required'),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().default('USD'),
  promoCode: z.string().optional(),
});

export const promoCodeSchema = z.object({
  code: z
    .string()
    .min(3, 'Promo code must be at least 3 characters')
    .max(20, 'Promo code must be at most 20 characters')
    .regex(/^[A-Z0-9]+$/, 'Promo code must contain only uppercase letters and numbers'),
  purchaseType: purchaseTypeSchema,
});

export const confirmPurchaseSchema = z.object({
  intentId: z.string().uuid('Invalid intent ID'),
});

export const ledgerFiltersSchema = z.object({
  type: purchaseTypeSchema.optional(),
  status: transactionStatusSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const transactionSchema = z.object({
  id: z.string().uuid(),
  type: purchaseTypeSchema,
  itemId: z.string(),
  amount: z.number().positive(),
  status: transactionStatusSchema,
  createdAt: z.string().datetime(),
  releaseDate: z.string().datetime(),
  description: z.string(),
});

// Type inference
export type PurchaseIntentInput = z.infer<typeof purchaseIntentSchema>;
export type PromoCodeInput = z.infer<typeof promoCodeSchema>;
export type ConfirmPurchaseInput = z.infer<typeof confirmPurchaseSchema>;
export type LedgerFiltersInput = z.infer<typeof ledgerFiltersSchema>;
export type TransactionData = z.infer<typeof transactionSchema>;
