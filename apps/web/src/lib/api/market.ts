/**
 * Market API - Stub
 * Temporary placeholder until full implementation
 */

import type { MarketOffer, MarketFilters, MarketOffersResponse } from '@/types/market';
import type { Offer, CreateOfferInput, UpdateOfferInput, Subscription } from '@/types/offer';

/**
 * Query keys factory for React Query
 */
export const marketKeys = {
  offers: () => ['offers'] as const,
  offersList: (params: Record<string, any>) => ['offers', 'list', params] as const,
  offer: (id: string) => ['offers', 'detail', id] as const,
  subscriptions: () => ['subscriptions'] as const,
  marketOffers: (filters: MarketFilters) => ['market', 'offers', filters] as const,
  marketOffer: (id: string) => ['market', 'offer', id] as const,
};

/**
 * Fetch market offer by ID
 * @param offerId - The offer ID
 * @returns MarketOffer
 */
export async function fetchMarketOfferById(offerId: string): Promise<MarketOffer> {
  // Stub implementation - will be replaced with real API call
  throw new Error(`fetchMarketOfferById not implemented (offerId: ${offerId})`);
}

/**
 * Fetch all market offers with filters
 * @param filters - Market filters
 * @returns MarketOffersResponse
 */
export async function fetchMarketOffers(filters?: MarketFilters): Promise<MarketOffersResponse> {
  // Stub implementation - will be replaced with real API call
  return {
    offers: [],
    meta: {
      currentPage: filters?.page || 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: filters?.limit || 12,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
}

/**
 * Get offers (creator's own offers)
 */
export async function getOffers(params?: {
  page?: number;
  pageSize?: number;
  creatorId?: string;
  type?: string;
}): Promise<any> {
  // Stub implementation
  return {
    items: [],
    total: 0,
    page: params?.page || 1,
    pageSize: params?.pageSize || 10,
  };
}

/**
 * Get single offer by ID
 */
export async function getOffer(id: string): Promise<Offer> {
  // Stub implementation
  throw new Error(`getOffer not implemented (id: ${id})`);
}

/**
 * Create new offer
 */
export async function createOffer(input: CreateOfferInput): Promise<Offer> {
  // Stub implementation
  throw new Error('createOffer not implemented');
}

/**
 * Update existing offer
 */
export async function updateOffer(id: string, input: UpdateOfferInput): Promise<Offer> {
  // Stub implementation
  throw new Error(`updateOffer not implemented (id: ${id})`);
}

/**
 * Delete offer
 */
export async function deleteOffer(id: string): Promise<void> {
  // Stub implementation
  throw new Error(`deleteOffer not implemented (id: ${id})`);
}

/**
 * Get my subscriptions
 */
export async function getMySubscriptions(): Promise<Subscription[]> {
  // Stub implementation
  return [];
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<void> {
  // Stub implementation
  throw new Error(`cancelSubscription not implemented (id: ${subscriptionId})`);
}
