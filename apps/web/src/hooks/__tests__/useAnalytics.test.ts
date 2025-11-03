/**
 * useAnalytics Hook Tests (F10)
 * Tests for success, 401, and validation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { useAnalyticsOverview } from '../useAnalytics';
import * as analyticsApi from '@/lib/api/analytics';
import type { AdvancedAnalyticsOverview } from '@/types/analytics';

// Mock the API module
vi.mock('@/lib/api/analytics');

const mockOverviewData: AdvancedAnalyticsOverview = {
  totalRevenue: {
    label: 'Total Revenue',
    value: 50000,
    change: 12.5,
    trend: 'up',
    format: 'currency',
  },
  subscribers: {
    label: 'Subscribers',
    value: 1250,
    change: 8.3,
    trend: 'up',
    format: 'number',
  },
  arpu: {
    label: 'ARPU',
    value: 40,
    change: 3.8,
    trend: 'up',
    format: 'currency',
  },
  conversionRate: {
    label: 'Conversion Rate',
    value: 3.5,
    change: -0.5,
    trend: 'down',
    format: 'percentage',
  },
  churnRate: {
    label: 'Churn Rate',
    value: 2.1,
    change: -0.3,
    trend: 'up',
    format: 'percentage',
  },
  newSubscribers: {
    label: 'New Subscribers',
    value: 150,
    change: 15.4,
    trend: 'up',
    format: 'number',
  },
  mrr: {
    label: 'MRR',
    value: 45000,
    change: 10.2,
    trend: 'up',
    format: 'currency',
  },
  ltv: {
    label: 'LTV',
    value: 1920,
    change: 5.1,
    trend: 'up',
    format: 'currency',
  },
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useAnalyticsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch analytics overview successfully', async () => {
    vi.mocked(analyticsApi.fetchAnalyticsOverview).mockResolvedValue(mockOverviewData);

    const { result } = renderHook(
      () =>
        useAnalyticsOverview({
          period: '30d',
          segment: 'all',
          source: 'all',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockOverviewData);
    expect(result.current.data?.totalRevenue.value).toBe(50000);
    expect(result.current.data?.subscribers.value).toBe(1250);
    expect(result.current.data?.arpu.value).toBe(40);
    expect(analyticsApi.fetchAnalyticsOverview).toHaveBeenCalledWith({
      period: '30d',
      segment: 'all',
      source: 'all',
    });
  });

  it('should handle 401 unauthorized error', async () => {
    const unauthorizedError = new Error('Unauthorized');
    (unauthorizedError as any).response = { status: 401 };

    vi.mocked(analyticsApi.fetchAnalyticsOverview).mockRejectedValue(unauthorizedError);

    const { result } = renderHook(
      () =>
        useAnalyticsOverview({
          period: '30d',
          segment: 'all',
          source: 'all',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toBe('Unauthorized');
    expect(result.current.data).toBeUndefined();
  });

  it('should validate filter parameters', async () => {
    vi.mocked(analyticsApi.fetchAnalyticsOverview).mockResolvedValue(mockOverviewData);

    const { result } = renderHook(
      () =>
        useAnalyticsOverview({
          period: '7d',
          segment: 'paying',
          source: 'market',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(analyticsApi.fetchAnalyticsOverview).toHaveBeenCalledWith({
      period: '7d',
      segment: 'paying',
      source: 'market',
    });
  });

  it('should handle validation error for invalid filters', async () => {
    const validationError = new Error('Invalid filter period');
    vi.mocked(analyticsApi.fetchAnalyticsOverview).mockRejectedValue(validationError);

    const { result } = renderHook(
      () =>
        useAnalyticsOverview({
          period: 'invalid' as any,
          segment: 'all',
          source: 'all',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should handle network errors', async () => {
    const networkError = new Error('Network request failed');
    vi.mocked(analyticsApi.fetchAnalyticsOverview).mockRejectedValue(networkError);

    const { result } = renderHook(
      () =>
        useAnalyticsOverview({
          period: '30d',
          segment: 'all',
          source: 'all',
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Network request failed');
  });

  it('should use default filters when none provided', async () => {
    vi.mocked(analyticsApi.fetchAnalyticsOverview).mockResolvedValue(mockOverviewData);

    const { result } = renderHook(() => useAnalyticsOverview(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(analyticsApi.fetchAnalyticsOverview).toHaveBeenCalledWith({
      period: '30d',
      segment: 'all',
      source: 'all',
    });
  });
});
