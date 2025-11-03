'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import {
  formatCurrency,
  formatDateTime,
  getTransactionTypeLabel,
  getTransactionStatusLabel,
  getTransactionTypeVariant,
  getTransactionStatusVariant,
  type RecentTransactions,
  type Transaction,
} from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface RecentTransactionsProps {
  data: RecentTransactions | undefined;
  isLoading: boolean;
  onViewAll?: () => void;
}

function TransactionRow({ transaction }: { transaction: Transaction }) {
  const isNegative =
    transaction.type === 'refund' || transaction.type === 'payout';

  return (
    <div className="flex items-center gap-4 py-3">
      {/* User Avatar */}
      {transaction.user && (
        <Avatar className="h-10 w-10">
          <AvatarImage src={transaction.user.avatar || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
            {transaction.user.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      )}

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-foreground truncate">
            {transaction.description}
          </p>
          <Badge variant={getTransactionTypeVariant(transaction.type)} className="shrink-0">
            {getTransactionTypeLabel(transaction.type)}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatDateTime(transaction.date)}</span>
          {transaction.user && (
            <>
              <span>•</span>
              <span className="truncate">{transaction.user.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Amount & Status */}
      <div className="flex flex-col items-end gap-1">
        <div
          className={cn(
            'text-sm font-semibold tabular-nums',
            isNegative ? 'text-red-600' : 'text-green-600'
          )}
        >
          {isNegative ? '-' : '+'}
          {formatCurrency(transaction.amount)}
        </div>
        <Badge
          variant={getTransactionStatusVariant(transaction.status)}
          className="text-xs"
        >
          {getTransactionStatusLabel(transaction.status)}
        </Badge>
      </div>
    </div>
  );
}

export function RecentTransactions({
  data,
  isLoading,
  onViewAll,
}: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-9 w-24" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No recent transactions
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Recent Transactions</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {data.total.toLocaleString('fr-FR')} total transactions
          </p>
        </div>
        {onViewAll && data.hasMore && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {data.transactions.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </div>
        {data.hasMore && !onViewAll && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Load More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
