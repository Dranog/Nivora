'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUpIcon, ArrowDownIcon, Users, DollarSign, Clock } from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/types/dashboard';
import type { AdminStats } from '@/types/dashboard';
import { cn } from '@/lib/utils';

interface KpiGridProps {
  stats: AdminStats | undefined;
  isLoading: boolean;
}

export function KpiGrid({ stats, isLoading }: KpiGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const kpis = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString('fr-FR'),
      trend: stats.usersTrend,
      icon: Users,
      description: `+${stats.newUsersToday} today`,
    },
    {
      title: 'Revenue',
      value: formatCurrency(stats.revenue),
      trend: stats.revenueTrend,
      icon: DollarSign,
      description: `${formatCurrency(stats.revenueToday)} today`,
    },
    {
      title: 'Pending Payouts',
      value: stats.pendingPayouts.toString(),
      trend: stats.payoutsTrend,
      icon: Clock,
      description: formatCurrency(stats.pendingPayoutsAmount),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const isPositive = kpi.trend >= 0;
        const TrendIcon = isPositive ? ArrowUpIcon : ArrowDownIcon;

        return (
          <Card key={kpi.title} className="transition-shadow hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight mb-2">
                {kpi.value}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div
                  className={cn(
                    'flex items-center gap-1 font-medium',
                    isPositive ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  <TrendIcon className="h-4 w-4" />
                  <span>{formatPercentage(kpi.trend)}</span>
                </div>
                <span className="text-muted-foreground">{kpi.description}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
