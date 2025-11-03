'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, CreditCard, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import {
  formatCurrency,
  formatTimeAgo,
  getUserInitials,
  getTransactionTypeLabel,
  getTransactionTypeVariant,
  getTransactionStatusLabel,
  getTransactionStatusColor,
  getPaymentMethodLabel,
  type Transaction,
} from '@/types/transactions';

interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onViewTransaction: (transaction: Transaction) => void;
}

export function TransactionsTable({
  transactions,
  isLoading,
  onViewTransaction,
}: TransactionsTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Transaction
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">User</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Creator
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Amount
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Status
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">
              Payment
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-t hover:bg-muted/50">
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-mono">
                    {transaction.id.slice(0, 8)}...
                  </div>
                  {transaction.description && (
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {transaction.description}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={transaction.user.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {getUserInitials(transaction.user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-sm">
                      {transaction.user.username}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {transaction.user.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                {transaction.creator ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={transaction.creator.avatar || undefined}
                      />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(transaction.creator.username)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {transaction.creator.username}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </td>
              <td className="px-4 py-3">
                <Badge variant={getTransactionTypeVariant(transaction.type)}>
                  {getTransactionTypeLabel(transaction.type)}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </div>
                  {transaction.fee > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Fee: {formatCurrency(transaction.fee, transaction.currency)}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getTransactionStatusColor(transaction.status)}`}
                >
                  {getTransactionStatusLabel(transaction.status)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <div className="text-sm">
                    {getPaymentMethodLabel(transaction.paymentMethod)}
                  </div>
                  {transaction.last4 && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <CreditCard className="h-3 w-3" />
                      •••• {transaction.last4}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatTimeAgo(transaction.createdAt)}
              </td>
              <td className="px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewTransaction(transaction)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
