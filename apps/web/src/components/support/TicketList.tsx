/**
 * TicketList Component
 * Display support tickets with filters
 */

'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, User, Users } from 'lucide-react';
import type { Ticket, TicketFilters, TicketStatus, TicketPriority, TicketCategory } from '@/types/support';
import { TICKET_STATUSES, TICKET_PRIORITIES, TICKET_CATEGORIES } from '@/types/support';

interface TicketListProps {
  tickets: Ticket[];
  isLoading: boolean;
  isError: boolean;
  filters: TicketFilters;
  onFiltersChange: (filters: TicketFilters) => void;
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function TicketList({
  tickets,
  isLoading,
  isError,
  filters,
  onFiltersChange,
  page,
  limit,
  total,
  hasMore,
  onPageChange,
}: TicketListProps) {
  const router = useRouter();

  const getStatusBadge = (status: TicketStatus) => {
    const config = TICKET_STATUSES.find((s) => s.value === status);
    return <Badge className={config?.color}>{config?.label || status}</Badge>;
  };

  const getPriorityBadge = (priority: TicketPriority) => {
    const config = TICKET_PRIORITIES.find((p) => p.value === priority);
    return <Badge variant="outline" className={config?.color}>{config?.label || priority}</Badge>;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card data-testid="ticket-list">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Support Tickets ({total})</CardTitle>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Status filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  status: value === 'all' ? undefined : (value as TicketStatus),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[140px]" data-testid="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {TICKET_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority filter */}
            <Select
              value={filters.priority || 'all'}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  priority: value === 'all' ? undefined : (value as TicketPriority),
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[140px]" data-testid="priority-filter">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                {TICKET_PRIORITIES.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Assigned filter */}
            <Select
              value={
                filters.assigned === undefined ? 'all' : filters.assigned ? 'assigned' : 'unassigned'
              }
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  assigned: value === 'all' ? undefined : value === 'assigned',
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-[140px]" data-testid="assigned-filter">
                <SelectValue placeholder="Assignment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tickets</SelectItem>
                <SelectItem value="assigned">Assigned to Me</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Assigned</TableHead>
              <TableHead>Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-64" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            )}

            {!isLoading && !isError && tickets.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No tickets found
                </TableCell>
              </TableRow>
            )}

            {!isLoading && isError && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-destructive">
                  Failed to load tickets
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && tickets.map((ticket) => (
              <TableRow
                key={ticket.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/creator/support/${ticket.id}`)}
                data-testid={`ticket-row-${ticket.id}`}
              >
                <TableCell>
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">
                      {ticket.userName} ({ticket.userEmail})
                    </p>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                <TableCell className="capitalize">{ticket.category}</TableCell>
                <TableCell>
                  {ticket.assignedTo ? (
                    <div className="flex items-center gap-1 text-sm">
                      <User className="h-3 w-3" />
                      {ticket.assignedTo}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(ticket.updatedAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && total > limit && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} tickets
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                data-testid="prev-page-btn"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={!hasMore}
                data-testid="next-page-btn"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
