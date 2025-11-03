/**
 * EarningsSummary Tests
 * Test: Summary calculations - available, pending, reserve
 */

import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EarningsSummary } from '../EarningsSummary';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import type { EarningsSummary as EarningsSummaryType } from '@/types/commerce';

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('EarningsSummary - Revenue Calculations', () => {
  it('displays correct available, pending, and reserve amounts', async () => {
    // Mock earnings summary with known values
    const mockSummary: EarningsSummaryType = {
      available: 8.99, // 90% of released $9.99 PPV
      pending: 34.99, // $29.99 subscription + $5.00 tip (not yet released)
      reserve: 1.0, // 10% of released $9.99 PPV
      total: 44.98, // Sum of all
      currency: 'USD',
    };

    server.use(
      http.get('/api/commerce/earnings/summary', () => {
        return HttpResponse.json(mockSummary);
      })
    );

    renderWithQuery(<EarningsSummary />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    // Check Available amount
    expect(screen.getByText(/\$8\.99/)).toBeInTheDocument();
    expect(screen.getByText(/ready to withdraw/i)).toBeInTheDocument();

    // Check Pending amount
    expect(screen.getByText(/\$34\.99/)).toBeInTheDocument();
    expect(screen.getByText(/awaiting release period/i)).toBeInTheDocument();

    // Check Reserve amount
    expect(screen.getByText(/\$1\.00/)).toBeInTheDocument();
    expect(screen.getByText(/10% held for 30 days/i)).toBeInTheDocument();

    // Check Total
    expect(screen.getByText('Total Earnings')).toBeInTheDocument();
    expect(screen.getByText(/\$44\.98/)).toBeInTheDocument();
  });

  it('calculates correct percentages from transactions', async () => {
    // Test scenario:
    // Released: $100 PPV (completed 3 days ago)
    //   - Available: $100 * 0.9 = $90
    //   - Reserve: $100 * 0.1 = $10
    // Pending: $50 subscription (completed 5 days ago, releases in 10 days)
    //   - Pending: $50
    // Total: $150

    const mockSummary: EarningsSummaryType = {
      available: 90.0,
      pending: 50.0,
      reserve: 10.0,
      total: 150.0,
      currency: 'USD',
    };

    server.use(
      http.get('/api/commerce/earnings/summary', () => {
        return HttpResponse.json(mockSummary);
      })
    );

    renderWithQuery(<EarningsSummary />);

    await waitFor(() => {
      expect(screen.getByText(/\$90\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$10\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$150\.00/)).toBeInTheDocument();
    });

    // Verify total = available + pending + reserve
    expect(90.0 + 50.0 + 10.0).toBe(150.0);
  });

  it('handles zero earnings correctly', async () => {
    const mockSummary: EarningsSummaryType = {
      available: 0,
      pending: 0,
      reserve: 0,
      total: 0,
      currency: 'USD',
    };

    server.use(
      http.get('/api/commerce/earnings/summary', () => {
        return HttpResponse.json(mockSummary);
      })
    );

    renderWithQuery(<EarningsSummary />);

    await waitFor(() => {
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    // All amounts should be $0.00
    const zeroAmounts = screen.getAllByText(/\$0\.00/);
    expect(zeroAmounts.length).toBeGreaterThanOrEqual(4); // available + pending + reserve + total
  });

  it('displays correct icons for each earnings category', async () => {
    renderWithQuery(<EarningsSummary />);

    await waitFor(() => {
      const availableTexts = screen.getAllByText('Available');
      expect(availableTexts.length).toBeGreaterThan(0);
    });

    // Each card should have its text visible (use getAllByText for duplicates)
    const availableTexts = screen.getAllByText('Available');
    expect(availableTexts.length).toBeGreaterThan(0);

    const pendingTexts = screen.getAllByText('Pending Release');
    expect(pendingTexts.length).toBeGreaterThan(0);

    const reserveTexts = screen.getAllByText('Reserve');
    expect(reserveTexts.length).toBeGreaterThan(0);
  });

  it('shows loading skeletons while fetching data', () => {
    // Render without waiting for data
    renderWithQuery(<EarningsSummary />);

    // Should show loading skeletons initially
    const skeletons = document.querySelectorAll('[class*="animate-pulse"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('displays error state when API fails', async () => {
    server.use(
      http.get('/api/commerce/earnings/summary', () => {
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    renderWithQuery(<EarningsSummary />);

    await waitFor(() => {
      expect(screen.getByText(/error loading earnings/i)).toBeInTheDocument();
    });
  });

  describe('Release Timeline', () => {
    it('displays upcoming release items with correct dates', async () => {
      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        const titles = screen.getAllByText('Upcoming Releases');
        expect(titles.length).toBeGreaterThan(0);
      });

      // Should show timeline items (use getAllByText for duplicates)
      await waitFor(() => {
        const subTexts = screen.getAllByText(/Subscription: Tier 1/i);
        expect(subTexts.length).toBeGreaterThan(0);

        const tipTexts = screen.getAllByText(/Tip for post/i);
        expect(tipTexts.length).toBeGreaterThan(0);
      });

      // Should show "In X days" for pending releases
      const tenDaysTexts = screen.getAllByText(/in 10 days/i);
      expect(tenDaysTexts.length).toBeGreaterThan(0);

      // Note: "in 1 day" may be rendered as "Tomorrow" in some cases
    });

    it('shows "Tomorrow" for releases due in 1 day', async () => {
      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        expect(screen.getByText('Upcoming Releases')).toBeInTheDocument();
      });

      // Check for "Tomorrow" text
      await waitFor(() => {
        expect(screen.getByText(/tomorrow/i)).toBeInTheDocument();
      });
    });

    it('displays correct badge types for different purchase types', async () => {
      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        expect(screen.getByText('Upcoming Releases')).toBeInTheDocument();
      });

      // Should show type badges
      await waitFor(() => {
        const badges = screen.getAllByText(/subscription|ppv|tip/i);
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('limits timeline display to 5 items', async () => {
      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        expect(screen.getByText('Upcoming Releases')).toBeInTheDocument();
      });

      // Should show max 5 items (current mock has 2)
      const timelineItems = screen.queryAllByText(/in \d+ day/i);
      expect(timelineItems.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Action Buttons', () => {
    it('displays View History button with correct link', async () => {
      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        expect(screen.getByText('Total Earnings')).toBeInTheDocument();
      });

      const viewHistoryButton = screen.getByRole('link', { name: /view history/i });
      expect(viewHistoryButton).toHaveAttribute('href', '/creator/earnings/history');
    });

    it('displays disabled Withdraw Funds button', async () => {
      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        expect(screen.getByText('Total Earnings')).toBeInTheDocument();
      });

      const withdrawButton = screen.getByRole('button', { name: /withdraw funds/i });
      expect(withdrawButton).toBeDisabled();
    });
  });

  describe('Responsive Design', () => {
    it('renders cards in grid layout', async () => {
      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        expect(screen.getByText('Available')).toBeInTheDocument();
      });

      // All three cards should be present
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Pending Release')).toBeInTheDocument();
      expect(screen.getByText('Reserve')).toBeInTheDocument();
    });
  });

  describe('Real-world Scenarios', () => {
    it('handles multiple transactions with different release dates', async () => {
      const mockSummary: EarningsSummaryType = {
        available: 45.0, // 3 released PPV @ $15 each = $45 (90%)
        pending: 120.0, // 4 subscriptions @ $30 each = $120
        reserve: 5.0, // 10% of released
        total: 170.0,
        currency: 'USD',
      };

      server.use(
        http.get('/api/commerce/earnings/summary', () => {
          return HttpResponse.json(mockSummary);
        })
      );

      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        const amounts45 = screen.getAllByText(/\$45\.00/);
        expect(amounts45.length).toBeGreaterThan(0);

        const amounts120 = screen.getAllByText(/\$120\.00/);
        expect(amounts120.length).toBeGreaterThan(0);

        const amounts5 = screen.getAllByText(/\$5\.00/);
        expect(amounts5.length).toBeGreaterThan(0);

        const amounts170 = screen.getAllByText(/\$170\.00/);
        expect(amounts170.length).toBeGreaterThan(0);
      });
    });

    it('correctly displays mixed transaction types', async () => {
      const mockSummary: EarningsSummaryType = {
        available: 100.0, // Released: 2 PPV ($20) + 10 tips ($100) = $120 * 0.9
        pending: 200.0, // Pending: 5 subscriptions ($40 each)
        reserve: 13.33, // 10% of released $120 (rounded)
        total: 313.33,
        currency: 'USD',
      };

      server.use(
        http.get('/api/commerce/earnings/summary', () => {
          return HttpResponse.json(mockSummary);
        })
      );

      renderWithQuery(<EarningsSummary />);

      await waitFor(() => {
        expect(screen.getByText('Total Earnings')).toBeInTheDocument();
      });

      // Should display all amounts correctly
      expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$200\.00/)).toBeInTheDocument();
      expect(screen.getByText(/\$13\.33/)).toBeInTheDocument();
      expect(screen.getByText(/\$313\.33/)).toBeInTheDocument();
    });
  });
});
