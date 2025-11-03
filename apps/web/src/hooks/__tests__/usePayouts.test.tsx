/**
 * usePayouts Hook Tests
 * Test 1: Create payout success → invalidates wallet + earnings queries
 * Test 2: Create payout fail → shows error toast, no invalidation
 * Test 3: Balance decreases after successful payout
 * Test 4: MSW call count tracking for invalidations
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePayouts } from '../usePayouts';
import { useWallet } from '../useWallet';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import type { CreatePayoutRequest, PayoutRequestResponse } from '@/types/wallet';
import type { EarningsSummary } from '@/types/commerce';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePayouts Hook', () => {
  beforeEach(() => {
    mockToast.mockClear();
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Test 1: Create payout success → invalidates queries', () => {
    it('shows success toast and refetches data', async () => {
      const wrapper = createWrapper();

      const { result } = renderHook(() => usePayouts(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      const initialCount = result.current.payouts.length;

      // Create payout
      const payoutRequest: CreatePayoutRequest = {
        mode: 'standard',
        amount: 50.0,
        destination: {
          type: 'iban',
          iban: 'FR7630006000011234567890189',
        },
      };

      result.current.createPayout(payoutRequest);

      // Wait for mutation to complete
      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      }, { timeout: 3000 });

      // Should show success toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Payout Request Created',
            variant: 'default',
          })
        );
      }, { timeout: 3000 });

      // Payouts list should be updated
      await waitFor(() => {
        expect(result.current.payouts.length).toBe(initialCount + 1);
      }, { timeout: 2000 });
    });

    it('refetches balance after payout (call count tracking)', async () => {
      const wrapper = createWrapper();

      // Track API calls
      let balanceCalls = 0;
      server.use(
        http.get('/api/commerce/earnings/summary', async () => {
          balanceCalls++;
          await new Promise((resolve) => setTimeout(resolve, 100));
          const summary: EarningsSummary = {
            available: balanceCalls === 1 ? 100.0 : 50.0,
            pending: 30.0,
            reserve: 10.0,
            total: balanceCalls === 1 ? 140.0 : 90.0,
            currency: 'EUR',
          };
          return HttpResponse.json(summary);
        })
      );

      const { result: payoutsResult } = renderHook(() => usePayouts(), { wrapper });
      const { result: walletResult } = renderHook(() => useWallet(), { wrapper });

      // Wait for initial balance load
      await waitFor(() => {
        expect(walletResult.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(walletResult.current.balance?.available).toBe(100.0);
      expect(balanceCalls).toBe(1);

      // Create payout
      const payoutRequest: CreatePayoutRequest = {
        mode: 'standard',
        amount: 50.0,
        destination: {
          type: 'iban',
          iban: 'FR7630006000011234567890189',
        },
      };

      payoutsResult.current.createPayout(payoutRequest);

      // Wait for mutation
      await waitFor(() => {
        expect(payoutsResult.current.isCreating).toBe(false);
      }, { timeout: 3000 });

      // Balance should be refetched (call count increases)
      await waitFor(() => {
        expect(balanceCalls).toBeGreaterThan(1);
      }, { timeout: 3000 });

      // Balance should be updated
      await waitFor(() => {
        expect(walletResult.current.balance?.available).toBe(50.0);
      }, { timeout: 2000 });
    });

    it('invalidates earnings queries (call count tracking)', async () => {
      const wrapper = createWrapper();

      // Track earnings API calls
      let earningsCalls = 0;
      server.use(
        http.get('/api/commerce/earnings/summary', async () => {
          earningsCalls++;
          await new Promise((resolve) => setTimeout(resolve, 100));
          const summary: EarningsSummary = {
            available: 100.0,
            pending: 30.0,
            reserve: 10.0,
            total: 140.0,
            currency: 'EUR',
          };
          return HttpResponse.json(summary);
        })
      );

      const { result: payoutsResult } = renderHook(() => usePayouts(), { wrapper });
      const { result: walletResult } = renderHook(() => useWallet(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(walletResult.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      const initialEarningsCalls = earningsCalls;

      // Create payout
      const payoutRequest: CreatePayoutRequest = {
        mode: 'express',
        amount: 30.0,
        destination: {
          type: 'iban',
          iban: 'FR7630006000011234567890189',
        },
      };

      payoutsResult.current.createPayout(payoutRequest);

      // Wait for mutation
      await waitFor(() => {
        expect(payoutsResult.current.isCreating).toBe(false);
      }, { timeout: 3000 });

      // Earnings queries should be invalidated (calls increase)
      await waitFor(() => {
        expect(earningsCalls).toBeGreaterThan(initialEarningsCalls);
      }, { timeout: 3000 });
    });
  });

  describe('Test 2: Create payout fail → error toast, no invalidation', () => {
    it('shows error toast when payout fails', async () => {
      // Mock failure
      server.use(
        http.post('/api/wallet/payouts', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(
            { error: 'Insufficient balance for this payout' },
            { status: 400 }
          );
        })
      );

      const wrapper = createWrapper();
      const { result } = renderHook(() => usePayouts(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      // Create payout (will fail)
      const payoutRequest: CreatePayoutRequest = {
        mode: 'standard',
        amount: 500.0,
        destination: {
          type: 'iban',
          iban: 'FR7630006000011234567890189',
        },
      };

      result.current.createPayout(payoutRequest);

      // Wait for mutation
      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      }, { timeout: 3000 });

      // Should show error toast
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Payout Request Failed',
            variant: 'destructive',
          })
        );
      }, { timeout: 3000 });

      // Error should be set
      expect(result.current.createError).toBeTruthy();
    });

    it('does not invalidate queries on failure (call count tracking)', async () => {
      // Mock failure
      server.use(
        http.post('/api/wallet/payouts', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return HttpResponse.json(
            { error: 'Payment processing failed' },
            { status: 400 }
          );
        })
      );

      const wrapper = createWrapper();

      // Track balance API calls
      let balanceCalls = 0;
      server.use(
        http.get('/api/commerce/earnings/summary', async () => {
          balanceCalls++;
          await new Promise((resolve) => setTimeout(resolve, 100));
          const summary: EarningsSummary = {
            available: 100.0,
            pending: 30.0,
            reserve: 10.0,
            total: 140.0,
            currency: 'EUR',
          };
          return HttpResponse.json(summary);
        })
      );

      const { result: payoutsResult } = renderHook(() => usePayouts(), { wrapper });
      const { result: walletResult } = renderHook(() => useWallet(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(walletResult.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      const initialBalanceCalls = balanceCalls;

      // Create payout (will fail)
      const payoutRequest: CreatePayoutRequest = {
        mode: 'standard',
        amount: 50.0,
        destination: {
          type: 'iban',
          iban: 'FR7630006000011234567890189',
        },
      };

      payoutsResult.current.createPayout(payoutRequest);

      // Wait for mutation
      await waitFor(() => {
        expect(payoutsResult.current.isCreating).toBe(false);
      }, { timeout: 3000 });

      // Wait a bit to ensure no refetch
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Balance queries should NOT be invalidated (calls remain same)
      expect(balanceCalls).toBe(initialBalanceCalls);
    });
  });

  describe('Test 3: Balance decreases after successful payout', () => {
    it('shows decreased balance after payout', async () => {
      // Mock balance that decreases
      let balanceState = 100.0;
      server.use(
        http.get('/api/commerce/earnings/summary', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const summary: EarningsSummary = {
            available: balanceState,
            pending: 30.0,
            reserve: 10.0,
            total: balanceState + 40.0,
            currency: 'EUR',
          };
          return HttpResponse.json(summary);
        }),
        http.post('/api/wallet/payouts', async ({ request }) => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const body = (await request.json()) as CreatePayoutRequest;

          // Decrease balance
          balanceState -= body.amount;

          const response: PayoutRequestResponse = {
            id: 'payout-new',
            mode: body.mode,
            amount: body.amount,
            fees: 1.5,
            net: body.amount - 1.5,
            destination: body.destination,
            status: 'pending',
            createdAt: new Date().toISOString(),
            eta: '3-5 business days',
          };
          return HttpResponse.json(response);
        })
      );

      const wrapper = createWrapper();

      const { result: walletResult } = renderHook(() => useWallet(), { wrapper });
      const { result: payoutsResult } = renderHook(() => usePayouts(), { wrapper });

      // Wait for initial balance
      await waitFor(() => {
        expect(walletResult.current.balance?.available).toBe(100.0);
      }, { timeout: 3000 });

      // Create payout
      const payoutRequest: CreatePayoutRequest = {
        mode: 'standard',
        amount: 50.0,
        destination: {
          type: 'iban',
          iban: 'FR7630006000011234567890189',
        },
      };

      payoutsResult.current.createPayout(payoutRequest);

      // Wait for mutation
      await waitFor(() => {
        expect(payoutsResult.current.isCreating).toBe(false);
      }, { timeout: 3000 });

      // Balance should decrease
      await waitFor(() => {
        expect(walletResult.current.balance?.available).toBe(50.0);
      }, { timeout: 3000 });
    });
  });

  describe('Test 4: MSW call count tracking', () => {
    it('tracks payout creation API calls', async () => {
      const wrapper = createWrapper();

      // Track payout API calls
      let payoutCalls = 0;
      server.use(
        http.post('/api/wallet/payouts', async ({ request }) => {
          payoutCalls++;
          await new Promise((resolve) => setTimeout(resolve, 100));
          const body = (await request.json()) as CreatePayoutRequest;

          const response: PayoutRequestResponse = {
            id: `payout-${payoutCalls}`,
            mode: body.mode,
            amount: body.amount,
            fees: 1.5,
            net: body.amount - 1.5,
            destination: body.destination,
            status: 'pending',
            createdAt: new Date().toISOString(),
            eta: '3-5 business days',
          };
          return HttpResponse.json(response);
        })
      );

      const { result } = renderHook(() => usePayouts(), { wrapper });

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 3000 });

      expect(payoutCalls).toBe(0);

      // Create payout
      const payoutRequest: CreatePayoutRequest = {
        mode: 'standard',
        amount: 50.0,
        destination: {
          type: 'iban',
          iban: 'FR7630006000011234567890189',
        },
      };

      result.current.createPayout(payoutRequest);

      // Wait for mutation
      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      }, { timeout: 3000 });

      // Payout API should have been called
      expect(payoutCalls).toBe(1);
    });
  });
});
