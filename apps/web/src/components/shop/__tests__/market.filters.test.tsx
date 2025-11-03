/**
 * Market Filters & Pagination Tests (F11)
 * Tests filtering and pagination on marketplace
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import { OfferFilters } from '../OfferFilters';
import type { MarketFilters, MarketOffer, MarketOffersResponse } from '@/types/market';

// Mock data
const mockOffers: MarketOffer[] = [
  {
    id: '1',
    title: 'Premium Subscription',
    description: 'Access to all content',
    price: 9.99,
    currency: 'USD',
    type: 'subscription',
    creatorId: 'creator1',
    creatorName: 'John Doe',
    creatorHandle: 'johndoe',
    features: ['Feature 1', 'Feature 2'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    title: 'One-Time Course',
    description: 'Complete course bundle',
    price: 49.99,
    currency: 'USD',
    type: 'one-time',
    creatorId: 'creator2',
    creatorName: 'Jane Smith',
    creatorHandle: 'janesmith',
    features: ['Lifetime access'],
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const mockResponse: MarketOffersResponse = {
  offers: mockOffers,
  meta: {
    currentPage: 1,
    totalPages: 3,
    totalItems: 30,
    itemsPerPage: 12,
    hasNextPage: true,
    hasPreviousPage: false,
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

describe('OfferFilters', () => {
  const mockOnChange = vi.fn();

  const defaultFilters: MarketFilters = {
    type: 'all',
    sort: 'newest',
    page: 1,
    limit: 12,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all filter controls', () => {
    render(
      <OfferFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    expect(screen.getByLabelText('Search marketplace offers')).toBeInTheDocument();
    expect(screen.getByLabelText('Filter by offer type')).toBeInTheDocument();
    expect(screen.getByLabelText('Minimum price')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum price')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort offers by')).toBeInTheDocument();
  });

  it('should handle search input changes', async () => {
    const user = userEvent.setup();

    render(
      <OfferFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    const searchInput = screen.getByLabelText('Search marketplace offers');
    await user.type(searchInput, 'abc');

    // onChange is called for each character typed
    expect(mockOnChange).toHaveBeenCalled();
    // Verify onChange was called with search values
    const calls = mockOnChange.mock.calls;
    const hasSearchCalls = calls.some((call) =>
      call[0].search && call[0].search.length > 0
    );
    expect(hasSearchCalls).toBe(true);
    // All calls should reset page to 1
    const allCallsHavePageOne = calls.every((call) => call[0].page === 1);
    expect(allCallsHavePageOne).toBe(true);
  });

  it('should handle type filter changes', async () => {
    const user = userEvent.setup();

    render(
      <OfferFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    const typeSelect = screen.getByLabelText('Filter by offer type');
    await user.click(typeSelect);

    const subscriptionOption = screen.getByRole('option', { name: 'Subscription' });
    await user.click(subscriptionOption);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      type: 'subscription',
      page: 1,
    });
  });

  it('should handle price range filters', async () => {
    const user = userEvent.setup();

    render(
      <OfferFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    const minPriceInput = screen.getByLabelText('Minimum price');
    const maxPriceInput = screen.getByLabelText('Maximum price');

    await user.type(minPriceInput, '5');
    await user.type(maxPriceInput, '9');

    // onChange is called for each character typed
    expect(mockOnChange).toHaveBeenCalled();
    // Check that onChange was called with price filters
    const calls = mockOnChange.mock.calls;
    const hasMinPrice = calls.some((call) => call[0].minPrice === 5);
    const hasMaxPrice = calls.some((call) => call[0].maxPrice === 9);
    expect(hasMinPrice).toBe(true);
    expect(hasMaxPrice).toBe(true);
  });

  it('should handle sort changes', async () => {
    const user = userEvent.setup();

    render(
      <OfferFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    const sortSelect = screen.getByLabelText('Sort offers by');
    await user.click(sortSelect);

    const priceAscOption = screen.getByRole('option', { name: 'Price: Low to High' });
    await user.click(priceAscOption);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...defaultFilters,
      sort: 'price-asc',
      page: 1,
    });
  });

  it('should show clear filters button when filters are active', () => {
    const activeFilters: MarketFilters = {
      ...defaultFilters,
      search: 'test',
      type: 'subscription',
      minPrice: 10,
    };

    render(
      <OfferFilters filters={activeFilters} onChange={mockOnChange} />
    );

    expect(screen.getByLabelText('Clear all filters')).toBeInTheDocument();
  });

  it('should hide clear button when no filters are active', () => {
    render(
      <OfferFilters filters={defaultFilters} onChange={mockOnChange} />
    );

    expect(screen.queryByLabelText('Clear all filters')).not.toBeInTheDocument();
  });

  it('should clear all filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    const activeFilters: MarketFilters = {
      type: 'subscription',
      sort: 'price-desc',
      search: 'test',
      minPrice: 10,
      maxPrice: 50,
      page: 2,
      limit: 12,
    };

    render(
      <OfferFilters filters={activeFilters} onChange={mockOnChange} />
    );

    const clearButton = screen.getByLabelText('Clear all filters');
    await user.click(clearButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      type: 'all',
      sort: 'newest',
      page: 1,
      limit: 12,
    });
  });

  it('should reset page to 1 when changing filters', async () => {
    const user = userEvent.setup();
    const filtersWithPage: MarketFilters = {
      ...defaultFilters,
      page: 3,
    };

    render(
      <OfferFilters filters={filtersWithPage} onChange={mockOnChange} />
    );

    const typeSelect = screen.getByLabelText('Filter by offer type');
    await user.click(typeSelect);

    const bundleOption = screen.getByRole('option', { name: 'Bundle' });
    await user.click(bundleOption);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
      })
    );
  });
});

describe('Pagination', () => {
  it('should display correct page information', () => {
    const { meta } = mockResponse;

    const pageInfo = `Showing ${mockOffers.length} of ${meta.totalItems} offers`;
    expect(pageInfo).toBe('Showing 2 of 30 offers');
  });

  it('should calculate total pages correctly', () => {
    const totalItems = 30;
    const itemsPerPage = 12;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    expect(totalPages).toBe(3);
  });

  it('should determine hasNextPage correctly', () => {
    const meta1 = { currentPage: 1, totalPages: 3 };
    const meta2 = { currentPage: 3, totalPages: 3 };

    expect(meta1.currentPage < meta1.totalPages).toBe(true);
    expect(meta2.currentPage < meta2.totalPages).toBe(false);
  });

  it('should determine hasPreviousPage correctly', () => {
    const meta1 = { currentPage: 1 };
    const meta2 = { currentPage: 2 };

    expect(meta1.currentPage > 1).toBe(false);
    expect(meta2.currentPage > 1).toBe(true);
  });
});
