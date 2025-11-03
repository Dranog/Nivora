import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminToasts } from '@/lib/toasts';
import {
  getTransactions,
  getTransactionStats,
  getTransactionDetail,
  refundTransaction,
  cancelTransaction,
  transactionsKeys,
} from '@/lib/api/transactions';
import type {
  TransactionsQuery,
  RefundTransactionRequest,
  CancelTransactionRequest,
} from '@/types/transactions';

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch transactions list
 */
export function useTransactions(query: TransactionsQuery = {}) {
  return useQuery({
    queryKey: transactionsKeys.list(query),
    queryFn: () => getTransactions(query),
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to fetch transaction statistics
 */
export function useTransactionStats() {
  return useQuery({
    queryKey: transactionsKeys.stats(),
    queryFn: () => getTransactionStats(),
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

/**
 * Hook to fetch transaction detail
 */
export function useTransactionDetail(transactionId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: transactionsKeys.detail(transactionId),
    queryFn: () => getTransactionDetail(transactionId),
    staleTime: 30 * 1000,
    ...options,
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to refund transaction
 */
export function useRefundTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: RefundTransactionRequest;
    }) => refundTransaction(transactionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() });
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.detail(variables.transactionId),
      });
      adminToasts.transactions.refunded();
    },
    onError: (error: any) => {
      adminToasts.transactions.refundFailed(error?.message);
    },
  });
}

/**
 * Hook to cancel transaction
 */
export function useCancelTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: CancelTransactionRequest;
    }) => cancelTransaction(transactionId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transactionsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: transactionsKeys.stats() });
      queryClient.invalidateQueries({
        queryKey: transactionsKeys.detail(variables.transactionId),
      });
      adminToasts.transactions.cancelled();
    },
    onError: (error: any) => {
      adminToasts.transactions.cancelFailed(error?.message);
    },
  });
}
