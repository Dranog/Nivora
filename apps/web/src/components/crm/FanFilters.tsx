/**
 * FanFilters Component
 * Filters for fans list with debounced search
 */

'use client';

import { useState } from 'react';
import { Search, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { FanFilters as FanFiltersType, FanStage, FanTag } from '@/types/crm';
import { FAN_STAGES } from '@/types/crm';

interface FanFiltersProps {
  filters: FanFiltersType;
  onFiltersChange: (filters: FanFiltersType) => void;
  onExport: () => void;
  availableTags: FanTag[];
  isExporting?: boolean;
}

export function FanFilters({
  filters,
  onFiltersChange,
  onExport,
  availableTags,
  isExporting = false,
}: FanFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    onFiltersChange({ ...filters, search: value, page: 1 });
  };

  const handleStageChange = (value: string) => {
    onFiltersChange({
      ...filters,
      stage: value === 'all' ? undefined : (value as FanStage),
      page: 1,
    });
  };

  const handleTagsChange = (tagId: string) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((id) => id !== tagId)
      : [...currentTags, tagId];

    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags : undefined,
      page: 1,
    });
  };

  return (
    <div className="space-y-4" data-testid="fan-filters">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search fans by name or email..."
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
            data-testid="search-input"
          />
        </div>

        {/* Stage filter */}
        <Select
          value={filters.stage || 'all'}
          onValueChange={handleStageChange}
        >
          <SelectTrigger className="w-full md:w-[180px]" data-testid="stage-filter">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            {FAN_STAGES.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Export button */}
        <Button
          onClick={onExport}
          variant="outline"
          disabled={isExporting}
          data-testid="export-csv-btn"
        >
          <Download className="mr-2 h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {/* Tags filter */}
      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2" data-testid="tags-filter">
          {availableTags.map((tag) => {
            const isSelected = filters.tags?.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => handleTagsChange(tag.id)}
                className={`rounded-full px-3 py-1 text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                style={
                  isSelected
                    ? { backgroundColor: tag.color, color: 'white' }
                    : undefined
                }
                data-testid={`tag-filter-${tag.id}`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
