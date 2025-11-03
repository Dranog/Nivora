/**
 * usePayouts Hook
 * Manages payout requests list and creation
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPayoutRequests, createPayoutRequest, getKycStatus, startKycVerification } from '@/lib/api/wallet';
import type { CreatePayoutRequest } from '@/types/wallet';
import { useToast } from '@/hooks/use-toast';

interface UsePayoutsOptions {
  page?: number;
  limit?: number;
  status?: string;
}

export function usePayouts(options?: UsePayoutsOptions) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query: List payouts
  const listQuery = useQuery({
    queryKey: ['wallet', 'payouts', options],
    queryFn: () => getPayoutRequests(options),
    staleTime: 60000, // 1 minute
  });

  // Mutation: Create payout
  const createMutation = useMutation({
    mutationFn: createPayoutRequest,
    onSuccess: (data) => {
      // Invalidate ALL relevant queries (exact: false for prefix matching)
      queryClient.invalidateQueries({ queryKey: ['wallet'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['earnings', 'summary'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['earnings', 'ledger'], exact: false });
      queryClient.invalidateQueries({ queryKey: ['payouts'], exact: false });

      toast({
        title: 'Payout Request Created',
        description: `Your ${data.mode} payout of €${data.amount.toFixed(2)} has been submitted.`,
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Payout Request Failed',
        description: error.message || 'Unable to process your payout request. Please try again.',
        variant: 'destructive',
      });
    },
  });

  return {
    // List
    payouts: listQuery.data?.payouts || [],
    total: listQuery.data?.total || 0,
    hasMore: listQuery.data?.hasMore || false,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    error: listQuery.error,

    // Create
    createPayout: createMutation.mutate,
    isCreating: createMutation.isPending,
    createError: createMutation.error,
  };
}

/**
 * useKycStatus Hook
 */
export function useKycStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ['wallet', 'kyc', 'status'],
    queryFn: getKycStatus,
    staleTime: 300000, // 5 minutes
  });

  const startMutation = useMutation({
    mutationFn: startKycVerification,
    onSuccess: (data) => {
      // Redirect to KYC verification URL
      window.location.href = data.url;
    },
    onError: (error: Error) => {
      toast({
        title: 'KYC Verification Failed',
        description: error.message || 'Unable to start KYC verification.',
        variant: 'destructive',
      });
    },
  });

  return {
    status: query.data?.status || 'not_started',
    message: query.data?.message,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    startVerification: startMutation.mutate,
    isStarting: startMutation.isPending,
  };
}
