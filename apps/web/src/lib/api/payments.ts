/**
 * Payments API - F3 Checkout + Query Keys
 */

import { http } from '@/lib/http';
import {
  type CheckoutSessionInput,
  type CheckoutSessionResponse,
  type PaymentIntentInput,
  type PaymentIntentResponse,
  type PaymentHistory,
  checkoutSessionResponseSchema,
  paymentIntentResponseSchema,
  paymentHistorySchema,
} from '@/types/payment';

// Query keys
export const paymentsKeys = {
  all: ['payments'] as const,
  history: () => [...paymentsKeys.all, 'history'] as const,
  historyByUser: (userId: string) => [...paymentsKeys.history(), userId] as const,
  intent: (id: string) => [...paymentsKeys.all, 'intent', id] as const,
};

// Create checkout session
export async function createCheckoutSession(
  input: CheckoutSessionInput
): Promise<CheckoutSessionResponse> {
  const response = await http.post<CheckoutSessionResponse>('/payments/checkout', input);
  return checkoutSessionResponseSchema.parse(response);
}

// Create payment intent
export async function createPaymentIntent(
  input: PaymentIntentInput
): Promise<PaymentIntentResponse> {
  const response = await http.post<PaymentIntentResponse>('/payments/intents', input);
  return paymentIntentResponseSchema.parse(response);
}

// Get payment history
export async function getPaymentHistory(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PaymentHistory> {
  const response = await http.get<PaymentHistory>('/payments/history', { params });
  return paymentHistorySchema.parse(response);
}

// Confirm payment
export async function confirmPayment(paymentIntentId: string): Promise<void> {
  await http.post<void>(`/payments/intents/${paymentIntentId}/confirm`);
}

// Cancel payment
export async function cancelPayment(paymentIntentId: string): Promise<void> {
  await http.post<void>(`/payments/intents/${paymentIntentId}/cancel`);
}
