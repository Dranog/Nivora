/**
 * Payouts API - F3 Creator Payouts + Query Keys
 */

import { http } from '@/lib/http';
import {
  type Payout,
  type RequestPayoutInput,
  type PayoutBalance,
  type PayoutHistory,
  payoutSchema,
  payoutBalanceSchema,
  payoutHistorySchema,
} from '@/types/payout';

// Query keys
export const payoutsKeys = {
  all: ['payouts'] as const,
  lists: () => [...payoutsKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...payoutsKeys.lists(), filters] as const,
  details: () => [...payoutsKeys.all, 'detail'] as const,
  detail: (id: string) => [...payoutsKeys.details(), id] as const,
  balance: () => [...payoutsKeys.all, 'balance'] as const,
};

// Get payout balance
export async function getPayoutBalance(): Promise<PayoutBalance> {
  const response = await http.get<PayoutBalance>('/payouts/balance');
  return payoutBalanceSchema.parse(response);
}

// Get payout history
export async function getPayouts(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}): Promise<PayoutHistory> {
  const response = await http.get<PayoutHistory>('/payouts', { params });
  return payoutHistorySchema.parse(response);
}

// Get payout by ID
export async function getPayout(id: string): Promise<Payout> {
  const response = await http.get<Payout>(`/payouts/${id}`);
  return payoutSchema.parse(response);
}

// Request payout
export async function requestPayout(input: RequestPayoutInput): Promise<Payout> {
  const response = await http.post<Payout>('/payouts', input);
  return payoutSchema.parse(response);
}

// Cancel payout
export async function cancelPayout(id: string): Promise<Payout> {
  const response = await http.post<Payout>(`/payouts/${id}/cancel`);
  return payoutSchema.parse(response);
}
