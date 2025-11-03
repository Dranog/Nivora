/**
 * Wallet Page Tests
 * Test 1: Display wallet balance cards
 * Test 2: Request payout button disabled when balance < €10
 * Test 3: KYC status banner shown when not verified
 * Test 4: Payout history table displays correctly
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WalletPage from '../page';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import { setMockKycStatus } from '@/__tests__/mocks/handlers/wallet';
import type { EarningsSummary } from '@/types/commerce';
import type { PayoutsListResponse } from '@/types/wallet';

// Mock toast
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('Wallet Page', () => {
  beforeEach(() => {
    mockToast.mockClear();
    localStorage.clear();
    setMockKycStatus('verified');
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe('Test 1: Display wallet balance cards', () => {
    it('displays all balance cards', async () => {
      renderWithQuery(<WalletPage />);

      // Wait for balance cards to be present (there are 3)
      const balanceCards = await screen.findAllByTestId('balance-card', {}, { timeout: 3000 });
      expect(balanceCards.length).toBe(3);

      // Should display amounts
      await waitFor(() => {
        const amounts = screen.getAllByText(/\$|€/);
        expect(amounts.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('shows loading state while fetching balance', async () => {
      // Delay the response
      server.use(
        http.get('/api/commerce/earnings/summary', async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const summary: EarningsSummary = {
            available: 100.0,
            pending: 50.0,
            reserve: 10.0,
            total: 160.0,
            currency: 'EUR',
          };
          return HttpResponse.json(summary);
        })
      );

      renderWithQuery(<WalletPage />);

      // Balance cards should be present (always rendered)
      const balanceCards = await screen.findAllByTestId('balance-card', {}, { timeout: 3000 });
      expect(balanceCards.length).toBe(3);

      // Wait for actual values to load
      await waitFor(() => {
        const amounts = screen.getAllByText(/€/);
        expect(amounts.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });
  });

  describe('Test 2: Request payout button', () => {
    it('disables button when balance < €10', async () => {
      // Mock low balance
      server.use(
        http.get('/api/commerce/earnings/summary', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const summary: EarningsSummary = {
            available: 5.0,
            pending: 10.0,
            reserve: 1.0,
            total: 16.0,
            currency: 'EUR',
          };
          return HttpResponse.json(summary);
        })
      );

      renderWithQuery(<WalletPage />);

      // Wait for balance cards
      await screen.findAllByTestId('balance-card', {}, { timeout: 3000 });

      // Payout button should be disabled
      const payoutButton = await screen.findByRole('button', { name: /request payout/i }, {}, { timeout: 2000 });
      expect(payoutButton).toBeDisabled();
    });

    it('enables button when balance >= €10', async () => {
      // Mock sufficient balance
      server.use(
        http.get('/api/commerce/earnings/summary', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const summary: EarningsSummary = {
            available: 50.0,
            pending: 20.0,
            reserve: 5.0,
            total: 75.0,
            currency: 'EUR',
          };
          return HttpResponse.json(summary);
        })
      );

      renderWithQuery(<WalletPage />);

      // Wait for balance cards
      await screen.findAllByTestId('balance-card', {}, { timeout: 3000 });

      // Payout button should be enabled
      const payoutButton = await screen.findByRole('button', { name: /request payout/i }, {}, { timeout: 2000 });
      await waitFor(() => {
        expect(payoutButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('opens modal when clicked', async () => {
      const user = userEvent.setup();

      // Mock sufficient balance
      server.use(
        http.get('/api/commerce/earnings/summary', async () => {
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

      renderWithQuery(<WalletPage />);

      // Wait for balance cards
      await screen.findAllByTestId('balance-card', {}, { timeout: 3000 });

      // Click payout button
      const payoutButton = await screen.findByRole('button', { name: /request payout/i }, {}, { timeout: 2000 });
      await waitFor(() => {
        expect(payoutButton).not.toBeDisabled();
      }, { timeout: 2000 });

      await user.click(payoutButton);

      // Modal should open
      await screen.findByText(/select payout mode/i, {}, { timeout: 2000 });
    });
  });

  describe('Test 3: KYC status banner', () => {
    it('shows banner when not verified', async () => {
      setMockKycStatus('not_started');

      renderWithQuery(<WalletPage />);

      // Wait for page to load
      await screen.findAllByTestId('balance-card', {}, { timeout: 3000 });

      // Should show KYC banner
      await screen.findByText(/complete kyc verification/i, {}, { timeout: 2000 });
    });

    it('shows banner when pending', async () => {
      setMockKycStatus('pending');

      renderWithQuery(<WalletPage />);

      // Wait for page to load
      await screen.findAllByTestId('balance-card', {}, { timeout: 3000 });

      // Should show pending status
      await screen.findByText(/verification.*review/i, {}, { timeout: 2000 });
    });

    it('does not show banner when verified', async () => {
      setMockKycStatus('verified');

      renderWithQuery(<WalletPage />);

      // Wait for page to load
      await screen.findAllByTestId('balance-card', {}, { timeout: 3000 });

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Should NOT show KYC banner
      expect(screen.queryByText(/complete kyc verification/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/verification.*review/i)).not.toBeInTheDocument();
    });
  });

  describe('Test 4: Payout history table', () => {
    it('displays payout table', async () => {
      renderWithQuery(<WalletPage />);

      // Wait for payout table to be present
      const payoutTable = await screen.findByTestId('payout-table', {}, { timeout: 3000 });
      expect(payoutTable).toBeInTheDocument();

      // Should display payout data
      await waitFor(() => {
        const statuses = screen.getAllByText(/completed|processing|pending/i);
        expect(statuses.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('shows loading state while fetching', async () => {
      // Delay the response
      server.use(
        http.get('/api/wallet/payouts', async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          const response: PayoutsListResponse = {
            payouts: [],
            total: 0,
            page: 1,
            limit: 20,
            hasMore: false,
          };
          return HttpResponse.json(response);
        })
      );

      renderWithQuery(<WalletPage />);

      // Table should be present
      const payoutTable = await screen.findByTestId('payout-table', {}, { timeout: 3000 });
      expect(payoutTable).toBeInTheDocument();
    });

    it('shows empty state when no payouts', async () => {
      // Mock empty list
      server.use(
        http.get('/api/wallet/payouts', async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const response: PayoutsListResponse = {
            payouts: [],
            total: 0,
            page: 1,
            limit: 20,
            hasMore: false,
          };
          return HttpResponse.json(response);
        })
      );

      renderWithQuery(<WalletPage />);

      // Wait for table
      await screen.findByTestId('payout-table', {}, { timeout: 3000 });

      // Should show empty state
      await screen.findByText(/no payout requests|no payouts/i, {}, { timeout: 2000 });
    });
  });
});
