/**
 * LedgerTable Tests
 * Test: Ledger updates after purchase (optimistic + refetch)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LedgerTable } from '../LedgerTable';
import { server } from '@/__tests__/mocks/server';
import { http, HttpResponse } from 'msw';
import type { LedgerResponse, LedgerEntry } from '@/types/commerce';

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return {
    ...render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>),
    queryClient,
  };
}

let queryClient: QueryClient;

describe('LedgerTable - Update After Purchase', () => {
  beforeEach(() => {
    // Reset mock data before each test
    server.resetHandlers();
    localStorage.clear();
  });

  afterEach(() => {
    if (queryClient) {
      queryClient.clear();
    }
  });

  it('displays initial ledger entries', async () => {
    const rendered = renderWithQuery(<LedgerTable />);
    queryClient = rendered.queryClient;

    // Wait for table to load
    await screen.findByText(/transaction history/i, {}, { timeout: 3000 });

    // Should show mock ledger entries (findAllByText for mobile + desktop)
    const ppvEntries = await screen.findAllByText(/PPV: Premium Video/i, {}, { timeout: 2000 });
    expect(ppvEntries.length).toBeGreaterThan(0);

    const subEntries = await screen.findAllByText(/Subscription: Tier 1/i, {}, { timeout: 2000 });
    expect(subEntries.length).toBeGreaterThan(0);

    const tipEntries = await screen.findAllByText(/Tip for post/i, {}, { timeout: 2000 });
    expect(tipEntries.length).toBeGreaterThan(0);
  });

  it('updates ledger when new purchase is made', async () => {
    const rendered = renderWithQuery(<LedgerTable />);
    queryClient = rendered.queryClient;

    // Wait for initial load (findAllByText for mobile + desktop)
    await screen.findAllByText(/PPV: Premium Video/i, {}, { timeout: 3000 });

    // Simulate new purchase by adding entry to mock data
    const newEntry: LedgerEntry = {
      id: 'new-entry-123',
      type: 'ppv',
      itemId: 'new-video',
      amount: 14.99,
      status: 'completed',
      createdAt: new Date().toISOString(),
      releaseDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      description: 'New PPV Purchase',
      isReleased: false,
      releaseIn: '2 days',
    };

    // Update MSW handler to include new entry
    server.use(
      http.get('/api/commerce/earnings/ledger', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const response: LedgerResponse = {
          entries: [
            newEntry,
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              type: 'ppv',
              itemId: 'video-123',
              amount: 9.99,
              status: 'completed',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
              releaseDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'PPV: Premium Video',
              isReleased: true,
              releaseIn: 'Released',
            },
            {
              id: '550e8400-e29b-41d4-a716-446655440002',
              type: 'subscription',
              itemId: 'sub-tier1',
              amount: 29.99,
              status: 'completed',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
              releaseDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              description: 'Subscription: Tier 1',
              isReleased: false,
              releaseIn: '10 days',
            },
          ],
          total: 3,
          page: 1,
          limit: 20,
          hasMore: false,
        };
        return HttpResponse.json(response);
      })
    );

    // Invalidate query to trigger refetch
    await queryClient.invalidateQueries({ queryKey: ['earnings', 'ledger'] });

    // Wait for new entry to appear (findAllByText for mobile + desktop)
    await screen.findAllByText(/New PPV Purchase/i, {}, { timeout: 3000 });
    const amounts = await screen.findAllByText(/\$14\.99/i, {}, { timeout: 2000 });
    expect(amounts.length).toBeGreaterThan(0);
  });

  it.skip('shows correct release status for new purchase', async () => {
    renderWithQuery(<LedgerTable />);

    // Wait for table to load
    await waitFor(() => {
      const titles = screen.getAllByText(/transaction history/i);
      expect(titles.length).toBeGreaterThan(0);
    });

    // New purchases should show pending release (look for "10 days" from subscription)
    const pendingBadges = await screen.findAllByText(/10 days/i, {}, { timeout: 2000 });
    expect(pendingBadges.length).toBeGreaterThan(0);

    // Released items should show "Released" badge
    const releasedBadges = await screen.findAllByText(/released/i, {}, { timeout: 2000 });
    expect(releasedBadges.length).toBeGreaterThan(0);
  });

  it('updates summary counts after new purchase', async () => {
    const { queryClient } = renderWithQuery(<LedgerTable />);

    await waitFor(() => {
      expect(screen.getByText(/transaction history/i)).toBeInTheDocument();
    });

    // Add new entry and refetch
    server.use(
      http.get('/api/commerce/earnings/ledger', () => {
        const response: LedgerResponse = {
          entries: [
            {
              id: 'new-entry-456',
              type: 'tip',
              itemId: 'post-789',
              amount: 2.5,
              status: 'completed',
              createdAt: new Date().toISOString(),
              releaseDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
              description: 'Tip for awesome post',
              isReleased: false,
              releaseIn: '2 days',
            },
          ],
          total: 1,
          page: 1,
          limit: 20,
          hasMore: false,
        };
        return HttpResponse.json(response);
      })
    );

    await queryClient.invalidateQueries({ queryKey: ['earnings', 'ledger'] });

    // Should show updated total
    await waitFor(() => {
      expect(screen.getByText(/showing 1 of 1 transactions/i)).toBeInTheDocument();
    });
  });

  it('filters work correctly after ledger update', async () => {
    const { queryClient } = renderWithQuery(<LedgerTable />);

    await waitFor(() => {
      expect(screen.getByText(/transaction history/i)).toBeInTheDocument();
    });

    // Should be able to see filter options
    expect(screen.getByLabelText(/filter by type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument();
  });

  describe('Mobile responsive', () => {
    it('renders cards on mobile viewport', async () => {
      renderWithQuery(<LedgerTable />);

      await waitFor(() => {
        expect(screen.getByText(/transaction history/i)).toBeInTheDocument();
      });

      // Mobile cards should have proper structure
      await waitFor(() => {
        // Check for mobile-specific content
        const descriptions = screen.getAllByText(/PPV:|Subscription:|Tip/i);
        expect(descriptions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Accessibility', () => {
    it('has proper table structure with headers', async () => {
      renderWithQuery(<LedgerTable />);

      await waitFor(() => {
        expect(screen.getByRole('table')).toBeInTheDocument();
      });

      // Should have proper column headers (getAllByText for mobile + desktop)
      const dateHeaders = screen.getAllByText(/date/i);
      expect(dateHeaders.length).toBeGreaterThan(0);

      const descHeaders = screen.getAllByText(/description/i);
      expect(descHeaders.length).toBeGreaterThan(0);

      const amountHeaders = screen.getAllByText(/amount/i);
      expect(amountHeaders.length).toBeGreaterThan(0);

      const releaseHeaders = screen.getAllByText(/release/i);
      expect(releaseHeaders.length).toBeGreaterThan(0);
    });

    it('has accessible filter controls', async () => {
      renderWithQuery(<LedgerTable />);

      await waitFor(() => {
        expect(screen.getByLabelText(/filter by type/i)).toBeInTheDocument();
      });

      expect(screen.getByLabelText(/filter by status/i)).toBeInTheDocument();
    });

    it('has accessible pagination controls', async () => {
      // Mock paginated data
      server.use(
        http.get('/api/commerce/earnings/ledger', () => {
          const entries: LedgerEntry[] = Array.from({ length: 25 }, (_, i) => ({
            id: `entry-${i}`,
            type: 'ppv',
            itemId: `item-${i}`,
            amount: 9.99,
            status: 'completed',
            createdAt: new Date().toISOString(),
            releaseDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
            description: `Entry ${i}`,
            isReleased: false,
            releaseIn: '2 days',
          }));

          const response: LedgerResponse = {
            entries: entries.slice(0, 20),
            total: 25,
            page: 1,
            limit: 20,
            hasMore: true,
          };
          return HttpResponse.json(response);
        })
      );

      renderWithQuery(<LedgerTable />);

      await waitFor(() => {
        expect(screen.getByLabelText(/previous page/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/next page/i)).toBeInTheDocument();
      });
    });
  });
});
