/**
 * Market API - F3 Offers/Subscriptions + F11 Marketplace
 */

import { http } from '@/lib/http';
import {
  type Offer,
  type CreateOfferInput,
  type UpdateOfferInput,
  type OfferList,
  type Subscription,
  offerSchema,
  offerListSchema,
  subscriptionSchema,
} from '@/types/offer';
import type {
  MarketFilters,
  MarketOffer,
  MarketOffersResponse,
} from '@/types/market';
import {
  MarketFiltersSchema,
  MarketOfferSchema,
  MarketOffersResponseSchema,
} from '@/types/market';

// Query keys
export const marketKeys = {
  all: ['market'] as const,
  offers: () => [...marketKeys.all, 'offers'] as const,
  offersList: (filters: Record<string, unknown>) => [...marketKeys.offers(), filters] as const,
  offer: (id: string) => [...marketKeys.offers(), id] as const,
  subscriptions: () => [...marketKeys.all, 'subscriptions'] as const,
  subscription: (id: string) => [...marketKeys.subscriptions(), id] as const,
  byCreator: (creatorId: string) => [...marketKeys.offers(), 'byCreator', creatorId] as const,
  // F11 Marketplace keys
  marketplace: () => [...marketKeys.all, 'marketplace'] as const,
  marketOffers: (filters: MarketFilters) => [...marketKeys.marketplace(), 'offers', filters] as const,
  marketOffer: (id: string) => [...marketKeys.marketplace(), 'offer', id] as const,
};

// Get offers
export async function getOffers(params?: {
  page?: number;
  pageSize?: number;
  creatorId?: string;
  type?: string;
}): Promise<OfferList> {
  const response = await http.get<OfferList>('/market/offers', { params });
  return offerListSchema.parse(response);
}

// Get offer by ID
export async function getOffer(id: string): Promise<Offer> {
  const response = await http.get<Offer>(`/market/offers/${id}`);
  return offerSchema.parse(response);
}

// Create offer
export async function createOffer(input: CreateOfferInput): Promise<Offer> {
  const response = await http.post<Offer>('/market/offers', input);
  return offerSchema.parse(response);
}

// Update offer
export async function updateOffer(id: string, input: UpdateOfferInput): Promise<Offer> {
  const response = await http.patch<Offer>(`/market/offers/${id}`, input);
  return offerSchema.parse(response);
}

// Delete offer
export async function deleteOffer(id: string): Promise<void> {
  await http.delete<void>(`/market/offers/${id}`);
}

// Get my subscriptions
export async function getMySubscriptions(): Promise<Subscription[]> {
  const response = await http.get<Subscription[]>('/market/subscriptions');
  return response.map((s) => subscriptionSchema.parse(s));
}

// Get subscription by ID
export async function getSubscription(id: string): Promise<Subscription> {
  const response = await http.get<Subscription>(`/market/subscriptions/${id}`);
  return subscriptionSchema.parse(response);
}

// Cancel subscription
export async function cancelSubscription(id: string): Promise<Subscription> {
  const response = await http.post<Subscription>(`/market/subscriptions/${id}/cancel`);
  return subscriptionSchema.parse(response);
}

// ============================================================================
// F11 Marketplace API
// ============================================================================

/**
 * Fetch paginated list of marketplace offers with advanced filters
 * Used for public marketplace browsing with enriched creator info
 */
export async function fetchMarketOffers(
  filters: MarketFilters
): Promise<MarketOffersResponse> {
  const validatedFilters = MarketFiltersSchema.parse(filters);

  const response = await http.get<MarketOffersResponse>('/marketplace/offers', {
    params: validatedFilters,
  });

  return MarketOffersResponseSchema.parse(response);
}

/**
 * Fetch single marketplace offer by ID with enriched details
 * Used for offer detail page with full creator information
 */
export async function fetchMarketOfferById(id: string): Promise<MarketOffer> {
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid offer ID');
  }

  const response = await http.get<MarketOffer>(`/marketplace/offers/${id}`);
  return MarketOfferSchema.parse(response);
}
