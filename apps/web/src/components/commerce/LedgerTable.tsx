/**
 * LedgerTable Component
 * Display earnings ledger with filters and pagination
 */

'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useEnhancedLedger } from '@/hooks/useEarnings';
import type { PurchaseType, TransactionStatus, LedgerFilters } from '@/types/commerce';

const TYPE_COLORS: Record<PurchaseType, string> = {
  subscription: 'bg-blue-100 text-blue-800',
  ppv: 'bg-purple-100 text-purple-800',
  tip: 'bg-green-100 text-green-800',
};

const STATUS_COLORS: Record<TransactionStatus, string> = {
  completed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export function LedgerTable() {
  const [filters, setFilters] = useState<LedgerFilters>({
    page: 1,
    limit: 20,
  });

  const { entries, data, isLoading, error } = useEnhancedLedger(filters);

  const handleFilterChange = (key: keyof LedgerFilters, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
      page: 1, // Reset to first page on filter change
    }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading Ledger</CardTitle>
          <CardDescription>
            {error instanceof Error ? error.message : 'Failed to load ledger data'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Detailed ledger of all earnings</CardDescription>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                handleFilterChange('type', value === 'all' ? undefined : value as PurchaseType)
              }
            >
              <SelectTrigger className="w-[140px]" aria-label="Filter by type">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
                <SelectItem value="ppv">PPV</SelectItem>
                <SelectItem value="tip">Tip</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.status || 'all'}
              onValueChange={(value) =>
                handleFilterChange('status', value === 'all' ? undefined : value as TransactionStatus)
              }
            >
              <SelectTrigger className="w-[140px]" aria-label="Filter by status">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableCaption>
                  {data?.total ? `Showing ${entries.length} of ${data.total} transactions` : ''}
                </TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Release</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={TYPE_COLORS[entry.type]}>
                          {entry.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={STATUS_COLORS[entry.status]}>
                          {entry.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${entry.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {entry.isReleased ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Released
                          </Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">{entry.releaseIn}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {entries.map((entry) => (
                <Card key={entry.id}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-bold text-lg">${entry.amount.toFixed(2)}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary" className={TYPE_COLORS[entry.type]}>
                        {entry.type.toUpperCase()}
                      </Badge>
                      <Badge variant="secondary" className={STATUS_COLORS[entry.status]}>
                        {entry.status}
                      </Badge>
                      {entry.isReleased ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Released
                        </Badge>
                      ) : (
                        <Badge variant="outline">In {entry.releaseIn}</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data && data.total > filters.limit! && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-muted-foreground">
                  Page {filters.page} of {Math.ceil(data.total / filters.limit!)}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={!data.hasMore}
                    aria-label="Next page"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
