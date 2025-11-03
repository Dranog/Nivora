/**
 * Admin Dashboard Types
 */

// ============================================================================
// Dashboard Stats (KPIs)
// ============================================================================

export interface AdminStats {
  totalUsers: number;
  newUsersToday: number;
  usersTrend: number; // percentage
  revenue: number; // in euros
  revenueToday: number;
  revenueTrend: number;
  pendingPayouts: number;
  pendingPayoutsAmount: number; // in euros
  payoutsTrend: number;
}

// ============================================================================
// Sales Overview Chart
// ============================================================================

export interface SalesDataPoint {
  date: string; // ISO date (YYYY-MM-DD)
  revenue: number;
  subscriptions: number;
  ppv: number;
  tips: number;
}

export interface SalesOverview {
  data: SalesDataPoint[];
  total: number;
  average: number;
  peak: SalesDataPoint;
}

export type SalesOverviewPeriod = '7d' | '30d' | '90d' | '1y';

export interface SalesOverviewQuery {
  period: SalesOverviewPeriod;
}

// ============================================================================
// Recent Transactions
// ============================================================================

export type TransactionType = 'subscription' | 'ppv' | 'tip' | 'refund' | 'payout';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  date: string; // ISO date
  description: string;
  type: TransactionType;
  amount: number; // in euros
  status: TransactionStatus;
  user?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface RecentTransactions {
  transactions: Transaction[];
  total: number;
  hasMore: boolean;
}

export interface RecentTransactionsQuery {
  limit: number;
  offset: number;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get badge variant for transaction type
 */
export function getTransactionTypeVariant(
  type: TransactionType
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (type) {
    case 'subscription':
      return 'default';
    case 'ppv':
      return 'secondary';
    case 'tip':
      return 'outline';
    case 'refund':
    case 'payout':
      return 'destructive';
    default:
      return 'default';
  }
}

/**
 * Get badge variant for transaction status
 */
export function getTransactionStatusVariant(
  status: TransactionStatus
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'pending':
      return 'secondary';
    case 'failed':
      return 'destructive';
    case 'refunded':
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Get label for transaction type
 */
export function getTransactionTypeLabel(type: TransactionType): string {
  switch (type) {
    case 'subscription':
      return 'Subscription';
    case 'ppv':
      return 'PPV';
    case 'tip':
      return 'Tip';
    case 'refund':
      return 'Refund';
    case 'payout':
      return 'Payout';
    default:
      return type;
  }
}

/**
 * Get label for transaction status
 */
export function getTransactionStatusLabel(status: TransactionStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Failed';
    case 'refunded':
      return 'Refunded';
    default:
      return status;
  }
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

/**
 * Format date and time for display
 */
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

/**
 * Get period label
 */
export function getPeriodLabel(period: SalesOverviewPeriod): string {
  switch (period) {
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '90d':
      return 'Last 90 days';
    case '1y':
      return 'Last year';
    default:
      return period;
  }
}
