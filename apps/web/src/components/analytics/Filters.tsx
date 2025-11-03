/**
 * Analytics Filters Component (F10)
 * Date range, segment, and source filters
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import type {
  AnalyticsFilters as AnalyticsFiltersType,
  AnalyticsPeriod,
  AnalyticsSegment,
  AnalyticsSource,
} from '@/types/analytics';

interface FiltersProps {
  filters: AnalyticsFiltersType;
  onChange: (filters: AnalyticsFiltersType) => void;
}

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
];

const SEGMENT_OPTIONS: { value: AnalyticsSegment; label: string }[] = [
  { value: 'all', label: 'All users' },
  { value: 'paying', label: 'Paying only' },
  { value: 'free', label: 'Free only' },
];

const SOURCE_OPTIONS: { value: AnalyticsSource; label: string }[] = [
  { value: 'all', label: 'All sources' },
  { value: 'market', label: 'Marketplace' },
  { value: 'direct', label: 'Direct' },
];

export function Filters({ filters, onChange }: FiltersProps) {
  const handlePeriodChange = (period: AnalyticsPeriod) => {
    onChange({ ...filters, period });
  };

  const handleSegmentChange = (segment: AnalyticsSegment) => {
    onChange({ ...filters, segment });
  };

  const handleSourceChange = (source: AnalyticsSource) => {
    onChange({ ...filters, source });
  };

  return (
    <div
      className="flex flex-wrap items-center gap-4"
      role="group"
      aria-label="Analytics filters"
    >
      {/* Period Filter */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden={true} />
        <Select value={filters.period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-[180px]" aria-label="Select time period">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Segment Filter */}
      <Select value={filters.segment} onValueChange={handleSegmentChange}>
        <SelectTrigger className="w-[150px]" aria-label="Select user segment">
          <SelectValue placeholder="Segment" />
        </SelectTrigger>
        <SelectContent>
          {SEGMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Source Filter */}
      <Select value={filters.source} onValueChange={handleSourceChange}>
        <SelectTrigger className="w-[150px]" aria-label="Select traffic source">
          <SelectValue placeholder="Source" />
        </SelectTrigger>
        <SelectContent>
          {SOURCE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset Button */}
      {(filters.period !== '30d' || filters.segment !== 'all' || filters.source !== 'all') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange({ period: '30d', segment: 'all', source: 'all' })}
          aria-label="Reset filters to default"
        >
          Reset
        </Button>
      )}
    </div>
  );
}
