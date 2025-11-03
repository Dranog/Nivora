// ==========================================
// DASHBOARD PAGE (Écran 1 - MANQUANT)
// ==========================================
// apps/web/app/(admin)/dashboard/page.tsx

'use client';

import { useState } from 'react';
import { useDashboardMetrics, useSalesOverview, useRecentTransactions } from '@/hooks/admin/useDashboard';
import { Card } from '@/components/ui/card';
import { MetricCard } from '@/components/admin/MetricCard';
import { SalesChart } from '@/components/admin/SalesChart';
import { TransactionsTable } from '@/components/admin/TransactionsTable';
import { TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');

  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics({ period });
  const { data: salesData, isLoading: salesLoading } = useSalesOverview({ period });
  const { data: transactions, isLoading: txLoading } = useRecentTransactions({ limit: 10 });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {p === '7d' ? 'Last 7 days' : p === '30d' ? 'Last 30 days' : 'Last 90 days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`€${((metrics?.totalRevenue || 0) / 100).toLocaleString()}`}
          change={metrics?.revenueGrowth || 0}
          icon={DollarSign}
          loading={metricsLoading}
        />
        <MetricCard
          title="Active Users"
          value={metrics?.activeUsers?.toLocaleString() || '0'}
          change={metrics?.usersGrowth || 0}
          icon={Users}
          loading={metricsLoading}
        />
        <MetricCard
          title="Conversion Rate"
          value={`${metrics?.conversionRate || 0}%`}
          change={metrics?.conversionGrowth || 0}
          icon={TrendingUp}
          loading={metricsLoading}
        />
        <MetricCard
          title="Pending Reports"
          value={metrics?.pendingReports?.toString() || '0'}
          change={0}
          icon={AlertCircle}
          variant="warning"
          loading={metricsLoading}
        />
      </div>

      {/* Sales Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sales Overview</h2>
            <p className="text-sm text-gray-600 mt-1">Revenue trend over time</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00B8A9]" />
              <span className="text-sm text-gray-600">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#FF6B6B]" />
              <span className="text-sm text-gray-600">Payouts</span>
            </div>
          </div>
        </div>
        <SalesChart data={salesData || []} loading={salesLoading} />
      </Card>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
          <a
            href="/admin/transactions"
            className="text-sm text-[#00B8A9] hover:text-[#00A395] font-medium"
          >
            View All →
          </a>
        </div>
        <TransactionsTable transactions={transactions || []} loading={txLoading} compact />
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Avg Transaction Value</p>
          <p className="text-2xl font-bold text-gray-900">
            €{((metrics?.avgTransactionValue || 0) / 100).toFixed(2)}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Active Subscriptions</p>
          <p className="text-2xl font-bold text-gray-900">
            {metrics?.activeSubscriptions?.toLocaleString() || '0'}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm text-gray-600 mb-2">Creator Earnings (Today)</p>
          <p className="text-2xl font-bold text-gray-900">
            €{((metrics?.creatorEarnings || 0) / 100).toLocaleString()}
          </p>
        </Card>
      </div>
    </div>
  );
}

// ==========================================
// DASHBOARD HOOKS (MANQUANTS)
// ==========================================
// apps/web/hooks/admin/useDashboard.ts

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/admin/api-client';

export function useDashboardMetrics(query: { period: string }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'metrics', query],
    queryFn: () => adminApi.dashboard.getMetrics(query),
    staleTime: 60000, // 1 minute
  });
}

export function useSalesOverview(query: { period: string }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'sales', query],
    queryFn: () => adminApi.dashboard.getSalesOverview(query),
    staleTime: 60000,
  });
}

export function useRecentTransactions(query: { limit: number }) {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'transactions', query],
    queryFn: () => adminApi.dashboard.getRecentTransactions(query),
    refetchInterval: 30000, // Auto-refresh every 30s
  });
}

// ==========================================
// METRIC CARD COMPONENT (MANQUANT)
// ==========================================
// apps/web/components/admin/MetricCard.tsx

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  variant?: 'default' | 'warning';
  loading?: boolean;
}

export function MetricCard({ title, value, change, icon: Icon, variant = 'default', loading }: MetricCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-16" />
      </Card>
    );
  }

  const isPositive = change >= 0;
  const colors = variant === 'warning' ? 'bg-orange-50' : 'bg-cyan-50';
  const iconColor = variant === 'warning' ? 'text-orange-600' : 'text-[#00B8A9]';

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className={`p-2 rounded-lg ${colors}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
      
      {change !== 0 && (
        <div className="flex items-center gap-1">
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(change)}%
          </span>
          <span className="text-sm text-gray-500">vs last period</span>
        </div>
      )}
    </Card>
  );
}

// ==========================================
// SALES CHART COMPONENT (MANQUANT)
// ==========================================
// apps/web/components/admin/SalesChart.tsx

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesChartProps {
  data: Array<{ date: string; revenue: number; payouts: number }>;
  loading?: boolean;
}

export function SalesChart({ data, loading }: SalesChartProps) {
  if (loading) {
    return <Skeleton className="h-80 w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00B8A9" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#00B8A9" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `€${(value / 100).toFixed(0)}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number) => [`€${(value / 100).toFixed(2)}`, '']}
            labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#00B8A9"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Revenue"
          />
          <Area
            type="monotone"
            dataKey="payouts"
            stroke="#FF6B6B"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPayouts)"
            name="Payouts"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ==========================================
// TRANSACTIONS TABLE COMPONENT (MANQUANT)
// ==========================================
// apps/web/components/admin/TransactionsTable.tsx

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
  id: string;
  user: {
    username: string;
    avatar: string | null;
  };
  type: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  loading?: boolean;
  compact?: boolean;
}

export function TransactionsTable({ transactions, loading, compact }: TransactionsTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        No transactions found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          {!compact && <TableHead>Time</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow key={tx.id} className="hover:bg-gray-50">
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={tx.user.avatar || undefined} />
                  <AvatarFallback>{tx.user.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-900">{tx.user.username}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={getTypeBadgeVariant(tx.type)}>
                {tx.type}
              </Badge>
            </TableCell>
            <TableCell className="font-semibold text-gray-900">
              €{(tx.amount / 100).toFixed(2)}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusBadgeVariant(tx.status)}>
                {tx.status}
              </Badge>
            </TableCell>
            {!compact && (
              <TableCell className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getTypeBadgeVariant(type: string): 'default' | 'outline' | 'success' | 'warning' {
  const variants: Record<string, any> = {
    SUBSCRIPTION: 'success',
    PPV: 'warning',
    TIP: 'outline',
    PURCHASE: 'default',
  };
  return variants[type] || 'default';
}

function getStatusBadgeVariant(status: string): 'default' | 'success' | 'warning' | 'error' {
  const variants: Record<string, any> = {
    SUCCESS: 'success',
    COMPLETED: 'success',
    PENDING: 'warning',
    FAILED: 'error',
  };
  return variants[status] || 'default';
}