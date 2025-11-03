/**
 * Commerce Types - Unified Payment System
 * Handles subscriptions, PPV, and tips
 */

export type PurchaseType = 'subscription' | 'ppv' | 'tip';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PurchaseIntent {
  type: PurchaseType;
  itemId: string;
  amount: number;
  currency?: string;
  promoCode?: string;
}

export interface PurchaseIntentResponse {
  intentId: string;
  amount: number;
  discount: number;
  finalAmount: number;
  promoApplied?: string;
}

export interface ConfirmPurchaseResponse {
  transactionId: string;
  status: TransactionStatus;
  itemId: string;
  message?: string;
}

export interface PromoCodeValidation {
  valid: boolean;
  code: string;
  discount: number; // percentage (0-100)
  message?: string;
}

export interface Transaction {
  id: string;
  type: PurchaseType;
  itemId: string;
  amount: number;
  status: TransactionStatus;
  createdAt: string; // ISO 8601
  releaseDate: string; // ISO 8601
  description: string;
}

export interface EarningsSummary {
  available: number; // Ready to withdraw
  pending: number; // Waiting for release period
  reserve: number; // 10% held for 30 days (chargebacks)
  total: number; // Sum of all
  currency: string;
}

export interface LedgerEntry extends Transaction {
  releaseIn?: string; // Human-readable: "2 days" | "Released"
  isReleased: boolean;
}

export interface LedgerFilters {
  type?: PurchaseType;
  status?: TransactionStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface LedgerResponse {
  entries: LedgerEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Release rules:
 * - PPV/tips: 48 hours
 * - Subscription: 15 days
 * - Reserve: 10% held for 30 days after release
 */
export const RELEASE_PERIODS: Record<PurchaseType, number> = {
  ppv: 48 * 60 * 60 * 1000, // 48h in ms
  tip: 48 * 60 * 60 * 1000, // 48h in ms
  subscription: 15 * 24 * 60 * 60 * 1000, // 15 days in ms
};

export const RESERVE_PERCENTAGE = 0.1; // 10%
export const RESERVE_PERIOD = 30 * 24 * 60 * 60 * 1000; // 30 days in ms
