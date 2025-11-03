/**
 * BalanceCard Component
 * Displays a wallet balance metric with title and formatted amount
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/api/wallet';

interface BalanceCardProps {
  title: string;
  amount?: number; // Optional during loading
  currency?: string;
  isLoading?: boolean;
}

export function BalanceCard({ title, amount, currency = 'EUR', isLoading }: BalanceCardProps) {
  return (
    <Card data-testid="balance-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <p className="text-3xl font-bold">
            {amount !== undefined ? formatCurrency(amount, currency) : '€0.00'}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
