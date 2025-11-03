/**
 * Analytics Overview Page (F10)
 * Main dashboard with KPIs and revenue metrics
 */

'use client';

import { Suspense, useState } from 'react';
import { Filters } from '@/components/analytics/Filters';
import { KpiCard } from '@/components/analytics/KpiCard';
import { TrendChart } from '@/components/analytics/TrendChart';
import { RetentionCohorts } from '@/components/analytics/RetentionCohorts';
import { Skeleton } from '@/components/ui/skeleton';
import { useAnalyticsDashboard, defaultFilters } from '@/hooks/useAnalytics';
import type { AnalyticsFilters } from '@/types/analytics';

export default function AnalyticsOverviewPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Overview</h1>
        <p className="text-muted-foreground">Track your performance and growth</p>
      </div>

      <Filters filters={filters} onChange={setFilters} />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent filters={filters} />
      </Suspense>
    </div>
  );
}

function DashboardContent({ filters }: { filters: AnalyticsFilters }) {
  const { overview, revenue, retention, isLoading, isError, error } = useAnalyticsDashboard(filters);

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <div className="text-destructive">Error: {error?.message}</div>;

  return (
    <>
      {/* KPI Cards */}
      {overview.data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard kpi={overview.data.totalRevenue} />
          <KpiCard kpi={overview.data.subscribers} />
          <KpiCard kpi={overview.data.arpu} />
          <KpiCard kpi={overview.data.conversionRate} />
          <KpiCard kpi={overview.data.churnRate} />
          <KpiCard kpi={overview.data.newSubscribers} />
          <KpiCard kpi={overview.data.mrr} />
          <KpiCard kpi={overview.data.ltv} />
        </div>
      )}

      {/* Revenue Trend */}
      {revenue.data && (
        <TrendChart
          title="Revenue Trends"
          data={revenue.data.timeSeries.map((d) => ({
            date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            revenue: d.revenue,
            subscriptions: d.subscriptions,
            oneTime: d.oneTime,
          }))}
          series={[
            { dataKey: 'revenue', name: 'Total Revenue', color: '#3b82f6' },
            { dataKey: 'subscriptions', name: 'Subscriptions', color: '#10b981' },
            { dataKey: 'oneTime', name: 'One-time', color: '#f59e0b' },
          ]}
          valueFormatter={(value) =>
            new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
          }
        />
      )}

      {/* Retention Cohorts */}
      {retention.data && <RetentionCohorts data={retention.data} />}
    </>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-96" />
      <Skeleton className="h-96" />
    </div>
  );
}
