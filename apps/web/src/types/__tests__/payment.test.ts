/**
 * Payment Zod Schema Tests - F3
 */

import { describe, it, expect } from 'vitest';
import {
  paymentSchema,
  checkoutSessionInputSchema,
  checkoutSessionResponseSchema,
  paymentIntentInputSchema,
  paymentIntentResponseSchema,
  paymentHistorySchema,
} from '../payment';

describe('Payment Schema', () => {
  describe('paymentSchema', () => {
    it('validates a valid payment object', () => {
      const validPayment = {
        id: 'payment-123',
        userId: 'user-123',
        amount: 1000, // $10.00
        currency: 'USD',
        status: 'succeeded',
        paymentMethod: 'card',
        description: 'Subscription payment',
        metadata: { planId: 'plan-123' },
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-02T00:00:00.000Z',
      };

      const result = paymentSchema.safeParse(validPayment);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe(1000);
        expect(result.data.status).toBe('succeeded');
      }
    });

    it('validates all payment statuses', () => {
      const statuses = ['pending', 'processing', 'succeeded', 'failed', 'canceled', 'refunded'];

      statuses.forEach((status) => {
        const payment = {
          id: 'payment-123',
          userId: 'user-123',
          amount: 1000,
          currency: 'USD',
          status,
          paymentMethod: 'card',
          createdAt: '2024-01-01T00:00:00.000Z',
        };

        const result = paymentSchema.safeParse(payment);
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid payment status', () => {
      const invalidPayment = {
        id: 'payment-123',
        userId: 'user-123',
        amount: 1000,
        currency: 'USD',
        status: 'invalid-status',
        paymentMethod: 'card',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = paymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('status');
      }
    });

    it('rejects invalid payment method', () => {
      const invalidPayment = {
        id: 'payment-123',
        userId: 'user-123',
        amount: 1000,
        currency: 'USD',
        status: 'succeeded',
        paymentMethod: 'invalid-method',
        createdAt: '2024-01-01T00:00:00.000Z',
      };

      const result = paymentSchema.safeParse(invalidPayment);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('paymentMethod');
      }
    });
  });

  describe('checkoutSessionInputSchema', () => {
    it('validates a valid checkout session input', () => {
      const validInput = {
        offerId: 'offer-123',
        successUrl: 'https://example.com/success',
        cancelUrl: 'https://example.com/cancel',
        metadata: { userId: 'user-123' },
      };

      const result = checkoutSessionInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('requires offerId, successUrl, and cancelUrl', () => {
      const incompleteInput = {
        offerId: 'offer-123',
      };

      const result = checkoutSessionInputSchema.safeParse(incompleteInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('rejects invalid URLs', () => {
      const invalidInput = {
        offerId: 'offer-123',
        successUrl: 'not-a-url',
        cancelUrl: 'https://example.com/cancel',
      };

      const result = checkoutSessionInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });

  describe('checkoutSessionResponseSchema', () => {
    it('validates a valid checkout session response', () => {
      const validResponse = {
        sessionId: 'session-123',
        checkoutUrl: 'https://checkout.stripe.com/session-123',
        expiresAt: '2024-01-01T01:00:00.000Z',
      };

      const result = checkoutSessionResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('paymentIntentInputSchema', () => {
    it('validates a valid payment intent input', () => {
      const validInput = {
        amount: 1000, // $10.00
        currency: 'USD',
        description: 'Tip payment',
      };

      const result = paymentIntentInputSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('rejects amount below minimum ($0.50)', () => {
      const invalidInput = {
        amount: 49, // $0.49
        currency: 'USD',
      };

      const result = paymentIntentInputSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toMatch(/0\.50/);
      }
    });

    it('uses default currency USD', () => {
      const minimalInput = {
        amount: 1000,
      };

      const result = paymentIntentInputSchema.safeParse(minimalInput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
      }
    });
  });

  describe('paymentIntentResponseSchema', () => {
    it('validates a valid payment intent response', () => {
      const validResponse = {
        id: 'pi_123',
        clientSecret: 'pi_123_secret_abc',
        amount: 1000,
        currency: 'USD',
        status: 'pending',
      };

      const result = paymentIntentResponseSchema.safeParse(validResponse);
      expect(result.success).toBe(true);
    });
  });

  describe('paymentHistorySchema', () => {
    it('validates a valid payment history response', () => {
      const validHistory = {
        data: [
          {
            id: 'payment-1',
            userId: 'user-123',
            amount: 1000,
            currency: 'USD',
            status: 'succeeded',
            paymentMethod: 'card',
            createdAt: '2024-01-01T00:00:00.000Z',
          },
          {
            id: 'payment-2',
            userId: 'user-123',
            amount: 2000,
            currency: 'USD',
            status: 'succeeded',
            paymentMethod: 'bank_account',
            createdAt: '2024-01-02T00:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        pageSize: 10,
      };

      const result = paymentHistorySchema.safeParse(validHistory);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.data.length).toBe(2);
        expect(result.data.total).toBe(2);
      }
    });
  });
});
