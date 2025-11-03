'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import {
  ModerationPriority,
  ModerationStatus,
  ModerationContentType,
  type ModerationQueueQuery,
} from '@/types/moderation';

interface ModerationFiltersProps {
  filters: ModerationQueueQuery;
  onFiltersChange: (filters: ModerationQueueQuery) => void;
  onReset: () => void;
}

export function ModerationFilters({
  filters,
  onFiltersChange,
  onReset,
}: ModerationFiltersProps) {
  const handleChange = (key: keyof ModerationQueueQuery, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined, page: 1 });
  };

  const activeCount = [
    filters.search,
    filters.priority,
    filters.status,
    filters.contentType,
    filters.assignedToId,
  ].filter(Boolean).length;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search moderation queue..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.priority || 'all'}
          onValueChange={(v) =>
            handleChange('priority', v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value={ModerationPriority.URGENT}>Urgent</SelectItem>
            <SelectItem value={ModerationPriority.HIGH}>High</SelectItem>
            <SelectItem value={ModerationPriority.MEDIUM}>Medium</SelectItem>
            <SelectItem value={ModerationPriority.LOW}>Low</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(v) =>
            handleChange('status', v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value={ModerationStatus.PENDING}>Pending</SelectItem>
            <SelectItem value={ModerationStatus.APPROVED}>Approved</SelectItem>
            <SelectItem value={ModerationStatus.REJECTED}>Rejected</SelectItem>
            <SelectItem value={ModerationStatus.ESCALATED}>
              Escalated
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.contentType || 'all'}
          onValueChange={(v) =>
            handleChange('contentType', v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value={ModerationContentType.POST}>Post</SelectItem>
            <SelectItem value={ModerationContentType.COMMENT}>
              Comment
            </SelectItem>
            <SelectItem value={ModerationContentType.USER}>User</SelectItem>
            <SelectItem value={ModerationContentType.MESSAGE}>
              Message
            </SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.assignedToId || 'all'}
          onValueChange={(v) =>
            handleChange('assignedToId', v === 'all' ? undefined : v)
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignments</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            <SelectItem value="me">Assigned to Me</SelectItem>
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
