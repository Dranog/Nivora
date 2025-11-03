import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Fetcher utility with auth headers
 */
const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const response = await fetch(url, {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Hook to fetch dashboard metrics
 */
export function useDashboardMetrics(query: { period: string }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'metrics', query],
    queryFn: () => fetcher(`${API_URL}/admin/dashboard/metrics?period=${query.period}`),
    staleTime: 60000, // 1 minute
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch sales overview data
 */
export function useSalesOverview(query: { period: string }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'sales', query],
    queryFn: () => fetcher(`${API_URL}/admin/dashboard/sales?period=${query.period}`),
    staleTime: 60000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to fetch recent transactions
 */
export function useRecentTransactions(query: { limit: number }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'transactions', query],
    queryFn: () => fetcher(`${API_URL}/admin/dashboard/transactions?limit=${query.limit}`),
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000, // Auto-refresh every 30s
    retry: 2,
    refetchOnWindowFocus: false,
  });
}
