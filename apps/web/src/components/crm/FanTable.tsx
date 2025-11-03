/**
 * FanTable Component
 * Display fans list with pagination
 */

'use client';

import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Fan } from '@/types/crm';
import { FAN_STAGES } from '@/types/crm';
import { formatCurrency } from '@/lib/api/wallet';

interface FanTableProps {
  fans: Fan[];
  isLoading: boolean;
  isError: boolean;
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function FanTable({
  fans,
  isLoading,
  isError,
  page,
  limit,
  total,
  hasMore,
  onPageChange,
}: FanTableProps) {
  const router = useRouter();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getStageColor = (stage: string) => {
    const stageConfig = FAN_STAGES.find((s) => s.value === stage);
    return stageConfig?.color || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Card data-testid="fan-table">
      <CardHeader>
        <CardTitle>Fans ({total})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fan</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead>Last Purchase</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                </TableRow>
              ))
            )}

            {!isLoading && !isError && fans.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No fans found
                </TableCell>
              </TableRow>
            )}

            {!isLoading && isError && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-destructive">
                  Failed to load fans
                </TableCell>
              </TableRow>
            )}

            {!isLoading && !isError && fans.map((fan) => (
              <TableRow
                key={fan.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/creator/crm/${fan.id}`)}
                data-testid={`fan-row-${fan.id}`}
              >
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={fan.avatar} alt={fan.name} />
                      <AvatarFallback>{getInitials(fan.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{fan.name}</div>
                      <div className="text-sm text-muted-foreground">{fan.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStageColor(fan.stage)}>
                    {FAN_STAGES.find((s) => s.value === fan.stage)?.label || fan.stage}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {fan.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-block rounded-full px-2 py-0.5 text-xs text-white"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                      </span>
                    ))}
                    {fan.tags.length > 2 && (
                      <span className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        +{fan.tags.length - 2}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(fan.totalSpent)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(fan.lastPurchase)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!isLoading && total > limit && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} fans
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
