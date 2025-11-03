/**
 * Commerce API Client
 * Handles all commerce-related API calls
 */

import type {
  PurchaseIntent,
  PurchaseIntentResponse,
  ConfirmPurchaseResponse,
  PromoCodeValidation,
  EarningsSummary,
  LedgerResponse,
  LedgerFilters,
  PurchaseType,
} from '@/types/commerce';
import { handleApiError } from '@/lib/errors';

const API_BASE = '/api/commerce';

/**
 * Create a purchase intent (step 1 of checkout)
 */
export async function createPurchaseIntent(
  data: PurchaseIntent
): Promise<PurchaseIntentResponse> {
  try {
    const response = await fetch(`${API_BASE}/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Confirm and complete a purchase (step 2 of checkout)
 */
export async function confirmPurchase(intentId: string): Promise<ConfirmPurchaseResponse> {
  try {
    const response = await fetch(`${API_BASE}/confirm/${intentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Validate a promo code
 */
export async function validatePromoCode(
  code: string,
  purchaseType: PurchaseType
): Promise<PromoCodeValidation> {
  try {
    const response = await fetch(`${API_BASE}/promo/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, purchaseType }),
      credentials: 'include',
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get earnings summary for creator
 */
export async function getEarningsSummary(): Promise<EarningsSummary> {
  try {
    const response = await fetch(`${API_BASE}/earnings/summary`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Get earnings ledger with optional filters
 */
export async function getEarningsLedger(filters?: LedgerFilters): Promise<LedgerResponse> {
  try {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
    }

    const url = `${API_BASE}/earnings/ledger${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    if (!response.ok) {
      throw await handleApiError(response);
    }

    return response.json();
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * Helper: Calculate release date based on purchase type
 */
export function calculateReleaseDate(type: PurchaseType, createdAt: Date | string): Date {
  const created = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
  const releasePeriods = {
    ppv: 48 * 60 * 60 * 1000, // 48 hours
    tip: 48 * 60 * 60 * 1000, // 48 hours
    subscription: 15 * 24 * 60 * 60 * 1000, // 15 days
  };

  return new Date(created.getTime() + releasePeriods[type]);
}

/**
 * Helper: Format time remaining until release
 */
export function formatTimeUntilRelease(releaseDate: Date | string): string {
  const release = typeof releaseDate === 'string' ? new Date(releaseDate) : releaseDate;
  const now = new Date();
  const diff = release.getTime() - now.getTime();

  if (diff <= 0) {
    return 'Released';
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours > 1 ? 's' : ''}`;
}
