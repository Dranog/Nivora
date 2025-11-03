import { http } from '../http';
import type {
  TransactionsQuery,
  TransactionsListResponse,
  TransactionDetail,
  TransactionStats,
  RefundTransactionRequest,
  CancelTransactionRequest,
} from '@/types/transactions';

// ============================================================================
// React Query Keys
// ============================================================================

export const transactionsKeys = {
  all: ['admin', 'transactions'] as const,
  lists: () => [...transactionsKeys.all, 'list'] as const,
  list: (query: TransactionsQuery) => [...transactionsKeys.lists(), query] as const,
  stats: () => [...transactionsKeys.all, 'stats'] as const,
  details: () => [...transactionsKeys.all, 'detail'] as const,
  detail: (id: string) => [...transactionsKeys.details(), id] as const,
};

// ============================================================================
// API Functions
// ============================================================================

/**
 * Get transactions list
 */
export async function getTransactions(
  query: TransactionsQuery = {}
): Promise<TransactionsListResponse> {
  return await http.get<TransactionsListResponse>('/admin/transactions', {
    params: query,
  });
}

/**
 * Get transaction statistics
 */
export async function getTransactionStats(): Promise<TransactionStats> {
  return await http.get<TransactionStats>('/admin/transactions/stats');
}

/**
 * Get transaction detail
 */
export async function getTransactionDetail(
  transactionId: string
): Promise<TransactionDetail> {
  return await http.get<TransactionDetail>(
    `/admin/transactions/${transactionId}`
  );
}

/**
 * Refund transaction
 */
export async function refundTransaction(
  transactionId: string,
  data: RefundTransactionRequest
): Promise<void> {
  return await http.post<void>(
    `/admin/transactions/${transactionId}/refund`,
    data
  );
}

/**
 * Cancel pending transaction
 */
export async function cancelTransaction(
  transactionId: string,
  data: CancelTransactionRequest
): Promise<void> {
  return await http.post<void>(
    `/admin/transactions/${transactionId}/cancel`,
    data
  );
}
