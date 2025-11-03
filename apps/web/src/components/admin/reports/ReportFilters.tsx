'use client';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { ReportType, ReportSeverity, ReportStatus, type ReportsQuery } from '@/types/reports';

interface ReportFiltersProps {
  filters: ReportsQuery;
  onFiltersChange: (filters: ReportsQuery) => void;
  onReset: () => void;
}

export function ReportFilters({ filters, onFiltersChange, onReset }: ReportFiltersProps) {
  const handleChange = (key: keyof ReportsQuery, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const activeCount = [filters.search, filters.type, filters.severity, filters.status].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reports..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={filters.type || 'all'} onValueChange={(v) => handleChange('type', v === 'all' ? undefined : v)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={ReportType.USER}>User</SelectItem>
            <SelectItem value={ReportType.POST}>Post</SelectItem>
            <SelectItem value={ReportType.COMMENT}>Comment</SelectItem>
            <SelectItem value={ReportType.MESSAGE}>Message</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.severity || 'all'} onValueChange={(v) => handleChange('severity', v === 'all' ? undefined : v)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value={ReportSeverity.CRITICAL}>Critical</SelectItem>
            <SelectItem value={ReportSeverity.HIGH}>High</SelectItem>
            <SelectItem value={ReportSeverity.MEDIUM}>Medium</SelectItem>
            <SelectItem value={ReportSeverity.LOW}>Low</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status || 'all'} onValueChange={(v) => handleChange('status', v === 'all' ? undefined : v)}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={ReportStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={ReportStatus.IN_REVIEW}>In Review</SelectItem>
            <SelectItem value={ReportStatus.RESOLVED}>Resolved</SelectItem>
            <SelectItem value={ReportStatus.DISMISSED}>Dismissed</SelectItem>
          </SelectContent>
        </Select>

        {activeCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            <X className="mr-2 h-4 w-4" />
            Clear ({activeCount})
          </Button>
        )}
      </div>
    </div>
  );
}
