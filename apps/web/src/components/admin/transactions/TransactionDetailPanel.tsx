'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RefreshCw, XCircle, User, Clock } from 'lucide-react';
import { useState } from 'react';
import {
  formatCurrency,
  formatDateTime,
  getUserInitials,
  getTransactionTypeLabel,
  getTransactionTypeVariant,
  getTransactionStatusLabel,
  getTransactionStatusColor,
  getPaymentMethodLabel,
  type Transaction,
} from '@/types/transactions';
import { useTransactionDetail, useRefundTransaction, useCancelTransaction } from '@/hooks/useAdminTransactions';

interface TransactionDetailPanelProps {
  transaction: Transaction | null;
  open: boolean;
  onClose: () => void;
}

export function TransactionDetailPanel({
  transaction,
  open,
  onClose,
}: TransactionDetailPanelProps) {
  const [refundReason, setRefundReason] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const { data: detail, isLoading } = useTransactionDetail(
    transaction?.id || '',
    { enabled: !!transaction && open }
  );
  const refundMutation = useRefundTransaction();
  const cancelMutation = useCancelTransaction();

  const handleRefund = async () => {
    if (!transaction || !refundReason) return;
    await refundMutation.mutateAsync({
      transactionId: transaction.id,
      data: { reason: refundReason, notifyUser: true },
    });
    onClose();
    setRefundReason('');
  };

  const handleCancel = async () => {
    if (!transaction || !cancelReason) return;
    await cancelMutation.mutateAsync({
      transactionId: transaction.id,
      data: { reason: cancelReason },
    });
    onClose();
    setCancelReason('');
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>

        {isLoading || !detail ? (
          <div className="py-8 text-center">Loading...</div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-muted/30">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getTransactionTypeVariant(detail.type)}>
                    {getTransactionTypeLabel(detail.type)}
                  </Badge>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium border ${getTransactionStatusColor(detail.status)}`}
                  >
                    {getTransactionStatusLabel(detail.status)}
                  </span>
                </div>
                <div className="text-sm font-mono text-muted-foreground">
                  {detail.id}
                </div>
                <div className="text-2xl font-bold mt-2">
                  {formatCurrency(detail.amount, detail.currency)}
                </div>
                {detail.fee > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Fee: {formatCurrency(detail.fee, detail.currency)} • Net:{' '}
                    {formatCurrency(detail.netAmount, detail.currency)}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="text-sm">{formatDateTime(detail.createdAt)}</div>
                {detail.completedAt && (
                  <>
                    <div className="text-sm text-muted-foreground mt-2">
                      Completed
                    </div>
                    <div className="text-sm">
                      {formatDateTime(detail.completedAt)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Participants */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border">
                <div className="text-sm font-semibold mb-2">Customer</div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={detail.user.avatar || undefined} />
                    <AvatarFallback>
                      {getUserInitials(detail.user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{detail.user.username}</div>
                    <div className="text-sm text-muted-foreground">
                      {detail.user.email}
                    </div>
                  </div>
                </div>
              </div>

              {detail.creator && (
                <div className="p-4 rounded-lg border">
                  <div className="text-sm font-semibold mb-2">Creator</div>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={detail.creator.avatar || undefined} />
                      <AvatarFallback>
                        {getUserInitials(detail.creator.username)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {detail.creator.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {detail.creator.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="p-4 rounded-lg border">
              <div className="text-sm font-semibold mb-3">Payment Details</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Method:</span>{' '}
                  {getPaymentMethodLabel(detail.paymentMethod)}
                </div>
                {detail.last4 && (
                  <div>
                    <span className="text-muted-foreground">Card:</span> ••••{' '}
                    {detail.last4}
                  </div>
                )}
                {detail.paymentProvider && (
                  <div>
                    <span className="text-muted-foreground">Provider:</span>{' '}
                    {detail.paymentProvider}
                  </div>
                )}
                {detail.paymentIntentId && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Intent ID:</span>{' '}
                    <span className="font-mono text-xs">
                      {detail.paymentIntentId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Failure Reason */}
            {detail.failureReason && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2 mb-2 text-red-900">
                  <XCircle className="h-4 w-4" />
                  <span className="font-semibold">Failure Reason</span>
                </div>
                <p className="text-sm text-red-800">{detail.failureReason}</p>
              </div>
            )}

            <Tabs defaultValue="related">
              <TabsList>
                <TabsTrigger value="related">
                  Related ({detail.relatedTransactions.length})
                </TabsTrigger>
                <TabsTrigger value="audit">
                  Audit Log ({detail.auditLog.length})
                </TabsTrigger>
                {detail.metadata && (
                  <TabsTrigger value="metadata">Metadata</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="related" className="space-y-2">
                {detail.relatedTransactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No related transactions
                  </p>
                ) : (
                  detail.relatedTransactions.map((tx) => (
                    <div key={tx.id} className="flex gap-3 p-3 rounded-lg border">
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {getTransactionTypeLabel(tx.type)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(tx.createdAt)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatCurrency(tx.amount)}
                        </div>
                        <Badge variant="outline">
                          {getTransactionStatusLabel(tx.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="audit" className="space-y-2">
                {detail.auditLog.map((log) => (
                  <div key={log.id} className="flex gap-3 p-3 rounded-lg border">
                    <User className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{log.action}</div>
                      <div className="text-xs text-muted-foreground">
                        by {log.performedBy.username} •{' '}
                        {formatDateTime(log.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>

              {detail.metadata && (
                <TabsContent value="metadata">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(detail.metadata, null, 2)}
                  </pre>
                </TabsContent>
              )}
            </Tabs>

            {/* Actions */}
            {detail.status === 'COMPLETED' && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Refund Reason</Label>
                  <Textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Explain why you're refunding this transaction..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleRefund}
                  disabled={!refundReason}
                  variant="destructive"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Issue Refund
                </Button>
              </div>
            )}

            {detail.status === 'PENDING' && (
              <div className="space-y-4 border-t pt-4">
                <div className="space-y-2">
                  <Label>Cancellation Reason</Label>
                  <Textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Explain why you're cancelling this transaction..."
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleCancel}
                  disabled={!cancelReason}
                  variant="destructive"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Transaction
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
