/**
 * useEarnings Hook
 * Handles earnings summary and ledger queries
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getEarningsSummary, getEarningsLedger, formatTimeUntilRelease } from '@/lib/api/commerce';
import type { LedgerFilters, LedgerEntry } from '@/types/commerce';
import { useMemo } from 'react';

/**
 * Query earnings summary (available, pending, reserve)
 */
export function useEarningsSummary() {
  return useQuery({
    queryKey: ['earnings', 'summary'],
    queryFn: getEarningsSummary,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Query earnings ledger with filters
 */
export function useEarningsLedger(filters?: LedgerFilters) {
  const queryKey = useMemo(() => {
    const key = ['earnings', 'ledger'];
    if (filters) {
      key.push(JSON.stringify(filters));
    }
    return key;
  }, [filters]);

  return useQuery({
    queryKey,
    queryFn: () => getEarningsLedger(filters),
    staleTime: 15 * 1000, // 15 seconds
    refetchOnWindowFocus: true,
  });
}

/**
 * Helper: Enhance ledger entries with computed properties
 */
export function useEnhancedLedger(filters?: LedgerFilters) {
  const ledgerQuery = useEarningsLedger(filters);

  const enhancedEntries = useMemo(() => {
    if (!ledgerQuery.data) return [];

    return ledgerQuery.data.entries.map((entry) => {
      const now = new Date();
      const releaseDate = new Date(entry.releaseDate);
      const isReleased = now >= releaseDate;
      const releaseIn = isReleased ? 'Released' : formatTimeUntilRelease(releaseDate);

      return {
        ...entry,
        isReleased,
        releaseIn,
      } as LedgerEntry;
    });
  }, [ledgerQuery.data]);

  return {
    ...ledgerQuery,
    entries: enhancedEntries,
  };
}

/**
 * Helper: Get release timeline data for charts
 */
export function useReleaseTimeline() {
  const summaryQuery = useEarningsSummary();
  const ledgerQuery = useEarningsLedger();

  const timeline = useMemo(() => {
    if (!ledgerQuery.data) return [];

    const now = new Date();

    return ledgerQuery.data.entries
      .filter((entry) => entry.status === 'completed' && !entry.isReleased)
      .map((entry) => {
        const releaseDate = new Date(entry.releaseDate);
        const daysUntilRelease = Math.ceil(
          (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          id: entry.id,
          type: entry.type,
          amount: entry.amount,
          releaseDate: entry.releaseDate,
          daysUntilRelease,
          description: entry.description,
        };
      })
      .sort((a, b) => a.daysUntilRelease - b.daysUntilRelease);
  }, [ledgerQuery.data]);

  return {
    timeline,
    isLoading: summaryQuery.isLoading || ledgerQuery.isLoading,
    error: summaryQuery.error || ledgerQuery.error,
  };
}

/**
 * Helper: Calculate earnings breakdown by type
 */
export function useEarningsBreakdown() {
  const ledgerQuery = useEarningsLedger();

  const breakdown = useMemo(() => {
    if (!ledgerQuery.data) {
      return {
        ppv: 0,
        subscription: 0,
        tip: 0,
      };
    }

    return ledgerQuery.data.entries
      .filter((entry) => entry.status === 'completed')
      .reduce(
        (acc, entry) => {
          acc[entry.type] += entry.amount;
          return acc;
        },
        { ppv: 0, subscription: 0, tip: 0 }
      );
  }, [ledgerQuery.data]);

  return {
    breakdown,
    isLoading: ledgerQuery.isLoading,
    error: ledgerQuery.error,
  };
}
