/**
 * Market Hooks - F3 React Query + F11 Marketplace
 */

import { useMutation, useQuery, useQueryClient, useSuspenseQuery, type UseQueryOptions, type UseMutationOptions, type UseSuspenseQueryOptions } from '@tanstack/react-query';
import * as marketApi from '@/lib/api/market';
import { marketKeys } from '@/lib/api/market';
import type { Offer, OfferList, CreateOfferInput, UpdateOfferInput, Subscription } from '@/types/offer';
import type { MarketFilters, MarketOffer, MarketOffersResponse } from '@/types/market';
import { mapErrorToToast } from '@/lib/errors';
import { useToast } from '@/hooks/use-toast';

/**
 * Get offers
 */
export function useOffers(
  params?: {
    page?: number;
    pageSize?: number;
    creatorId?: string;
    type?: string;
  },
  options?: Omit<UseQueryOptions<OfferList, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: marketKeys.offersList(params || {}),
    queryFn: () => marketApi.getOffers(params),
    ...options,
  });
}

/**
 * Get offer by ID
 */
export function useOffer(id: string, options?: Omit<UseQueryOptions<Offer, Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: marketKeys.offer(id),
    queryFn: () => marketApi.getOffer(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create offer mutation
 */
export function useCreateOffer(options?: UseMutationOptions<Offer, Error, CreateOfferInput>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: marketApi.createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.offers() });

      toast({
        title: 'Offer created',
        description: 'Your offer has been created successfully',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Update offer mutation
 */
export function useUpdateOffer(options?: UseMutationOptions<Offer, Error, { id: string; input: UpdateOfferInput }>) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, input }) => marketApi.updateOffer(id, input),
    onSuccess: (updatedOffer) => {
      queryClient.invalidateQueries({ queryKey: marketKeys.offers() });
      queryClient.setQueryData(marketKeys.offer(updatedOffer.id), updatedOffer);

      toast({
        title: 'Offer updated',
        description: 'Your offer has been updated successfully',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
    ...options,
  });
}

/**
 * Delete offer mutation
 */
export function useDeleteOffer() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: marketApi.deleteOffer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.offers() });

      toast({
        title: 'Offer deleted',
        description: 'Your offer has been deleted',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
  });
}

/**
 * Get my subscriptions
 */
export function useMySubscriptions(options?: Omit<UseQueryOptions<Subscription[], Error>, 'queryKey' | 'queryFn'>) {
  return useQuery({
    queryKey: marketKeys.subscriptions(),
    queryFn: marketApi.getMySubscriptions,
    ...options,
  });
}

/**
 * Cancel subscription mutation
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: marketApi.cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketKeys.subscriptions() });

      toast({
        title: 'Subscription canceled',
        description: 'Your subscription has been canceled',
      });
    },
    onError: (error) => {
      const { title, message } = mapErrorToToast(error);
      toast({
        title,
        description: message,
        variant: 'destructive',
      });
    },
  });
}

// ============================================================================
// F11 Marketplace Hooks
// ============================================================================

/**
 * Default filters for marketplace browsing
 */
export const defaultMarketFilters: MarketFilters = {
  type: 'all',
  sort: 'newest',
  page: 1,
  limit: 12,
};

/**
 * Get marketplace offers with advanced filters
 * Used for public marketplace browsing
 */
export function useMarketOffers(
  filters: MarketFilters = defaultMarketFilters,
  options?: Omit<UseQueryOptions<MarketOffersResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: marketKeys.marketOffers(filters),
    queryFn: () => marketApi.fetchMarketOffers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
}

/**
 * Get marketplace offers with Suspense
 */
export function useMarketOffersSuspense(
  filters: MarketFilters = defaultMarketFilters,
  options?: Omit<UseSuspenseQueryOptions<MarketOffersResponse, Error>, 'queryKey' | 'queryFn'>
) {
  return useSuspenseQuery({
    queryKey: marketKeys.marketOffers(filters),
    queryFn: () => marketApi.fetchMarketOffers(filters),
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

/**
 * Get single marketplace offer by ID
 * Used for offer detail page with enriched creator info
 */
export function useMarketOffer(
  id: string,
  options?: Omit<UseQueryOptions<MarketOffer, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: marketKeys.marketOffer(id),
    queryFn: () => marketApi.fetchMarketOfferById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
}

/**
 * Get single marketplace offer with Suspense
 */
export function useMarketOfferSuspense(
  id: string,
  options?: Omit<UseSuspenseQueryOptions<MarketOffer, Error>, 'queryKey' | 'queryFn'>
) {
  return useSuspenseQuery({
    queryKey: marketKeys.marketOffer(id),
    queryFn: () => marketApi.fetchMarketOfferById(id),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}
