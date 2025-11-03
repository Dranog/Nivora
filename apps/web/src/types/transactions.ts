// Transaction Types for Oliver Platform Admin

// ============================================================================
// Enums
// ============================================================================

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  SUBSCRIPTION = 'SUBSCRIPTION',
  TIP = 'TIP',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  CHARGEBACK = 'CHARGEBACK',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CRYPTO = 'CRYPTO',
}

// ============================================================================
// Query & Filter Types
// ============================================================================

export interface TransactionsQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: TransactionType;
  status?: TransactionStatus;
  paymentMethod?: PaymentMethod;
  userId?: string;
  creatorId?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: 'createdAt' | 'amount' | 'type' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Transaction Types
// ============================================================================

export interface TransactionUser {
  id: string;
  username: string;
  email: string;
  avatar: string | null;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  userId: string;
  user: TransactionUser;
  creatorId: string | null;
  creator: TransactionUser | null;
  paymentMethod: PaymentMethod;
  paymentIntentId: string | null;
  paymentProvider: string | null;
  last4: string | null;
  description: string | null;
  metadata: Record<string, any> | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface TransactionsListResponse {
  items: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Transaction Detail Types
// ============================================================================

export interface RelatedTransaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: {
    id: string;
    username: string;
  };
  timestamp: string;
  metadata: any;
}

export interface TransactionDetail extends Transaction {
  relatedTransactions: RelatedTransaction[];
  providerDetails: any;
  auditLog: AuditLogEntry[];
}

// ============================================================================
// Stats Types
// ============================================================================

export interface TransactionStats {
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  pendingCount: number;
  completedCount: number;
  failedCount: number;
  refundedCount: number;
  disputedCount: number;
  purchaseVolume: number;
  subscriptionVolume: number;
  tipVolume: number;
  todayVolume: number;
  weekVolume: number;
  monthVolume: number;
  averageTransactionAmount: number;
  averageProcessingTime: number;
}

// ============================================================================
// Action Types
// ============================================================================

export interface RefundTransactionRequest {
  reason: string;
  amount?: number;
  notifyUser: boolean;
}

export interface CancelTransactionRequest {
  reason: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getTransactionTypeLabel(type: TransactionType): string {
  switch (type) {
    case TransactionType.PURCHASE:
      return 'Purchase';
    case TransactionType.SUBSCRIPTION:
      return 'Subscription';
    case TransactionType.TIP:
      return 'Tip';
    case TransactionType.PAYOUT:
      return 'Payout';
    case TransactionType.REFUND:
      return 'Refund';
    case TransactionType.CHARGEBACK:
      return 'Chargeback';
  }
}

export function getTransactionTypeVariant(
  type: TransactionType
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (type) {
    case TransactionType.PURCHASE:
      return 'default';
    case TransactionType.SUBSCRIPTION:
      return 'secondary';
    case TransactionType.TIP:
      return 'outline';
    case TransactionType.PAYOUT:
      return 'destructive';
    case TransactionType.REFUND:
      return 'destructive';
    case TransactionType.CHARGEBACK:
      return 'destructive';
  }
}

export function getTransactionStatusLabel(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.PENDING:
      return 'Pending';
    case TransactionStatus.COMPLETED:
      return 'Completed';
    case TransactionStatus.FAILED:
      return 'Failed';
    case TransactionStatus.REFUNDED:
      return 'Refunded';
    case TransactionStatus.DISPUTED:
      return 'Disputed';
  }
}

export function getTransactionStatusColor(status: TransactionStatus): string {
  switch (status) {
    case TransactionStatus.PENDING:
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case TransactionStatus.COMPLETED:
      return 'text-green-600 bg-green-50 border-green-200';
    case TransactionStatus.FAILED:
      return 'text-red-600 bg-red-50 border-red-200';
    case TransactionStatus.REFUNDED:
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case TransactionStatus.DISPUTED:
      return 'text-purple-600 bg-purple-50 border-purple-200';
  }
}

export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.CARD:
      return 'Card';
    case PaymentMethod.BANK_TRANSFER:
      return 'Bank Transfer';
    case PaymentMethod.WALLET:
      return 'Wallet';
    case PaymentMethod.CRYPTO:
      return 'Crypto';
  }
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatTimeAgo(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const diff = new Date().getTime() - d.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(d);
}

export function getUserInitials(username: string): string {
  if (!username) return '?';
  const parts = username.split(/[\s_-]+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
}
