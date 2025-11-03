/**
 * PayoutRequestsTable Component
 * Displays payout history with status badges and details
 */

'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/api/wallet';
import { format } from 'date-fns';
import type { PayoutRequest } from '@/types/wallet';

interface PayoutRequestsTableProps {
  payouts: PayoutRequest[];
  isLoading?: boolean;
  isError?: boolean;
}

export function PayoutRequestsTable({ payouts, isLoading, isError }: PayoutRequestsTableProps) {
  const formatDate = (date: string | Date) => {
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout History</CardTitle>
      </CardHeader>
      <CardContent>
        <Table data-testid="payout-table">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <>
                {Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  </TableRow>
                ))}
              </>
            )}
            {!isLoading && !isError && payouts.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No payouts yet
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && payouts.map((payout) => (
              <TableRow key={payout.id}>
                <TableCell>{formatDate(payout.createdAt)}</TableCell>
                <TableCell>{payout.mode}</TableCell>
                <TableCell>€{payout.amount.toFixed(2)}</TableCell>
                <TableCell><Badge>{payout.status}</Badge></TableCell>
              </TableRow>
            ))}
            {isError && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-destructive">
                  Failed to load payouts
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
