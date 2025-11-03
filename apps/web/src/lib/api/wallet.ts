/**
 * Wallet API Client
 */

import type {
  WalletBalance,
  PayoutRequest,
  PayoutsListResponse,
  CreatePayoutRequest,
  PayoutRequestResponse,
  KycStatusResponse,
  PayoutMode,
  PayoutFees,
} from '@/types/wallet';
import { PAYOUT_FEES, PAYOUT_ETA } from '@/types/wallet';

const API_BASE = '/api/wallet';

/**
 * Get wallet balance (uses earnings summary from F6)
 */
export async function getWalletBalance(): Promise<WalletBalance> {
  const response = await fetch('/api/commerce/earnings/summary');

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch wallet balance');
  }

  const data = await response.json();

  // Transform earnings summary to wallet balance
  return {
    available: data.available,
    pending: data.pending,
    reserve: data.reserve,
    total: data.total,
    currency: data.currency || 'EUR',
    lastUpdate: new Date().toISOString(),
  };
}

/**
 * Get payout requests list
 */
export async function getPayoutRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<PayoutsListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', params.page.toString());
  if (params?.limit) searchParams.set('limit', params.limit.toString());
  if (params?.status) searchParams.set('status', params.status);

  const response = await fetch(`${API_BASE}/payouts?${searchParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch payout requests');
  }

  return response.json();
}

/**
 * Create payout request
 */
export async function createPayoutRequest(
  data: CreatePayoutRequest
): Promise<PayoutRequestResponse> {
  const response = await fetch(`${API_BASE}/payouts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message || 'Failed to create payout request');
  }

  return response.json();
}

/**
 * Get KYC status
 */
export async function getKycStatus(): Promise<KycStatusResponse> {
  const response = await fetch(`${API_BASE}/kyc/status`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch KYC status');
  }

  return response.json();
}

/**
 * Start KYC verification
 */
export async function startKycVerification(): Promise<{ url: string }> {
  const response = await fetch(`${API_BASE}/kyc/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to start KYC verification');
  }

  return response.json();
}

// ========== HELPERS ==========

/**
 * Calculate payout fees based on mode and amount
 */
export function calculatePayoutFees(amount: number, mode: PayoutMode): number {
  const fees: PayoutFees = PAYOUT_FEES[mode];

  // Calculate percentage-based fee
  const percentageFee = (amount * fees.percentage) / 100;

  // Add fixed fee if exists (crypto gas)
  const fixedFee = fees.fixed || 0;

  // Total fee
  const totalFee = percentageFee + fixedFee;

  // Apply minimum
  const finalFee = Math.max(totalFee, fees.minimum);

  return parseFloat(finalFee.toFixed(2));
}

/**
 * Calculate net amount after fees
 */
export function calculateNetAmount(amount: number, mode: PayoutMode): number {
  const fees = calculatePayoutFees(amount, mode);
  return parseFloat((amount - fees).toFixed(2));
}

/**
 * Get ETA for payout mode
 */
export function getPayoutEta(mode: PayoutMode): string {
  return PAYOUT_ETA[mode];
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}
