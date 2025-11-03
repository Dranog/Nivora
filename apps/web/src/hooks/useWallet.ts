/**
 * useWallet Hook
 * Fetches wallet balance from earnings API
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getWalletBalance } from '@/lib/api/wallet';

export function useWallet() {
  const query = useQuery({
    queryKey: ['wallet', 'balance'],
    queryFn: getWalletBalance,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });

  return {
    balance: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
