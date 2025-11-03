/**
 * Wallet & Payout Types
 */

export type PayoutMode = 'standard' | 'express' | 'crypto';
export type CryptoNetwork = 'ETH' | 'USDT';
export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type KycStatus = 'not_started' | 'pending' | 'verified' | 'rejected';

export interface WalletBalance {
  available: number;
  pending: number;
  reserve: number;
  total: number;
  currency: string;
  lastUpdate: string; // ISO date
}

export interface PayoutFees {
  percentage: number;
  minimum: number;
  fixed?: number; // For crypto gas
}

export interface PayoutDestination {
  type: 'iban' | 'crypto';
  iban?: string;
  cryptoAddress?: string;
  cryptoNetwork?: CryptoNetwork;
}

export interface PayoutRequest {
  id: string;
  mode: PayoutMode;
  amount: number;
  fees: number;
  net: number;
  destination: PayoutDestination;
  status: PayoutStatus;
  createdAt: string;
  processedAt?: string;
  eta: string; // Human-readable: "3-5 days", "24h", etc.
}

export interface CreatePayoutRequest {
  mode: PayoutMode;
  amount: number;
  destination: PayoutDestination;
}

export interface PayoutRequestResponse extends PayoutRequest {
  message?: string;
}

export interface PayoutsListResponse {
  payouts: PayoutRequest[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface KycStatusResponse {
  status: KycStatus;
  message?: string;
  updatedAt?: string;
}

// Fee structure by mode
export const PAYOUT_FEES: Record<PayoutMode, PayoutFees> = {
  standard: { percentage: 1.5, minimum: 1.0 },
  express: { percentage: 2.9, minimum: 2.0 },
  crypto: { percentage: 1.2, minimum: 0, fixed: 0.5 }, // 1.2% + 0.50€ gas
};

// ETA by mode
export const PAYOUT_ETA: Record<PayoutMode, string> = {
  standard: '3-5 business days',
  express: '24 hours',
  crypto: '1-2 hours',
};

// Minimum payout amount
export const MIN_PAYOUT_AMOUNT = 10.0;
