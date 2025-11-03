/**
 * Market Listing Page (F11)
 * Browse marketplace offers with filters and pagination
 */

'use client';

import { useState } from 'react';
import { OfferCard } from '@/components/shop/OfferCard';
import { OfferFilters } from '@/components/shop/OfferFilters';
import { CartDrawer } from '@/components/shop/CartDrawer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMarketOffers, defaultMarketFilters } from '@/hooks/useMarket';
import type { MarketFilters } from '@/types/market';

export default function MarketPage() {
  const [filters, setFilters] = useState<MarketFilters>(defaultMarketFilters);

  const { data, isLoading, isError, error } = useMarketOffers(filters);

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground">
            Discover offers from talented creators
          </p>
        </div>
        <CartDrawer />
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Filters Sidebar */}
        <aside className="space-y-4">
          <OfferFilters filters={filters} onChange={setFilters} />
        </aside>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-lg bg-muted"
                  aria-label="Loading..."
                />
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
              <p className="font-medium text-destructive">
                Failed to load offers
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {error?.message || 'An error occurred while fetching offers'}
              </p>
            </div>
          )}

          {/* Offers Grid */}
          {data && (
            <>
              {/* Results Count */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {data.offers.length} of {data.meta.totalItems} offers
                </p>
              </div>

              {/* Empty State */}
              {data.offers.length === 0 ? (
                <div className="rounded-lg border border-dashed p-12 text-center">
                  <p className="text-lg font-medium">No offers found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your filters
                  </p>
                </div>
              ) : (
                <>
                  {/* Offers Grid */}
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {data.offers.map((offer) => (
                      <OfferCard key={offer.id} offer={offer} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {data.meta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page - 1)}
                        disabled={!data.meta.hasPreviousPage}
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4" aria-hidden={true} />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1)
                          .filter(
                            (page) =>
                              page === 1 ||
                              page === data.meta.totalPages ||
                              Math.abs(page - filters.page) <= 1
                          )
                          .map((page, index, array) => (
                            <>
                              {index > 0 && array[index - 1] !== page - 1 && (
                                <span key={`ellipsis-${page}`} className="px-2">
                                  ...
                                </span>
                              )}
                              <Button
                                key={page}
                                variant={page === filters.page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="min-w-[2.5rem]"
                                aria-label={`Page ${page}`}
                                aria-current={page === filters.page ? 'page' : undefined}
                              >
                                {page}
                              </Button>
                            </>
                          ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(filters.page + 1)}
                        disabled={!data.meta.hasNextPage}
                        aria-label="Next page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" aria-hidden={true} />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
