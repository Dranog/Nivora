/**
 * Offer Filters Component (F11)
 * Filter controls for marketplace browsing
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import type { MarketFilters, MarketSort, OfferType } from '@/types/market';
import { cn } from '@/lib/utils';

interface OfferFiltersProps {
  filters: MarketFilters;
  onChange: (filters: MarketFilters) => void;
  className?: string;
}

export function OfferFilters({ filters, onChange, className }: OfferFiltersProps) {
  const handleSearchChange = (value: string) => {
    onChange({ ...filters, search: value || undefined, page: 1 });
  };

  const handleTypeChange = (value: OfferType) => {
    onChange({ ...filters, type: value, page: 1 });
  };

  const handleSortChange = (value: MarketSort) => {
    onChange({ ...filters, sort: value, page: 1 });
  };

  const handleMinPriceChange = (value: string) => {
    const numValue = parseFloat(value);
    onChange({
      ...filters,
      minPrice: isNaN(numValue) || value === '' ? undefined : numValue,
      page: 1,
    });
  };

  const handleMaxPriceChange = (value: string) => {
    const numValue = parseFloat(value);
    onChange({
      ...filters,
      maxPrice: isNaN(numValue) || value === '' ? undefined : numValue,
      page: 1,
    });
  };

  const handleClearFilters = () => {
    onChange({
      type: 'all',
      sort: 'newest',
      page: 1,
      limit: filters.limit,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.type !== 'all' ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.sort !== 'newest';

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-auto p-1 text-xs"
              aria-label="Clear all filters"
            >
              <X className="mr-1 h-3 w-3" aria-hidden={true} />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Search
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden={true} />
            <Input
              id="search"
              type="text"
              placeholder="Search offers..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
              aria-label="Search marketplace offers"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm font-medium">
            Offer Type
          </Label>
          <Select value={filters.type} onValueChange={handleTypeChange}>
            <SelectTrigger id="type" aria-label="Filter by offer type">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="subscription">Subscription</SelectItem>
              <SelectItem value="one-time">One-Time</SelectItem>
              <SelectItem value="bundle">Bundle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Price Range</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="minPrice" className="text-xs text-muted-foreground">
                Min
              </Label>
              <Input
                id="minPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={filters.minPrice ?? ''}
                onChange={(e) => handleMinPriceChange(e.target.value)}
                aria-label="Minimum price"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maxPrice" className="text-xs text-muted-foreground">
                Max
              </Label>
              <Input
                id="maxPrice"
                type="number"
                min="0"
                step="0.01"
                placeholder="Any"
                value={filters.maxPrice ?? ''}
                onChange={(e) => handleMaxPriceChange(e.target.value)}
                aria-label="Maximum price"
              />
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label htmlFor="sort" className="text-sm font-medium">
            Sort By
          </Label>
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger id="sort" aria-label="Sort offers by">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
