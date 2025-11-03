/**
 * Analytics Engagement Page (F10)
 * Engagement metrics, geographic distribution, and device breakdown
 */

'use client';

import { Suspense, useState } from 'react';
import { Filters } from '@/components/analytics/Filters';
import { KpiCard } from '@/components/analytics/KpiCard';
import { GeoHeatmap } from '@/components/analytics/GeoHeatmap';
import { DeviceBreakdown } from '@/components/analytics/DeviceBreakdown';
import { RetentionCohorts } from '@/components/analytics/RetentionCohorts';
import { Skeleton } from '@/components/ui/skeleton';
import { useEngagementDashboard, defaultFilters } from '@/hooks/useAnalytics';
import { formatKpi } from '@/types/analytics';
import type { AnalyticsFilters } from '@/types/analytics';

export default function AnalyticsEngagementPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Engagement Analytics</h1>
        <p className="text-muted-foreground">Understand how users interact with your content</p>
      </div>

      <Filters filters={filters} onChange={setFilters} />

      <Suspense fallback={<EngagementSkeleton />}>
        <EngagementContent filters={filters} />
      </Suspense>
    </div>
  );
}

function EngagementContent({ filters }: { filters: AnalyticsFilters }) {
  const { engagement, geo, devices, retention, isLoading, isError, error } =
    useEngagementDashboard(filters);

  if (isLoading) return <EngagementSkeleton />;
  if (isError) return <div className="text-destructive">Error: {error?.message}</div>;

  return (
    <>
      {/* Engagement KPIs */}
      {engagement.data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            kpi={formatKpi(
              'Daily Active Users',
              engagement.data.activeUsers.daily,
              engagement.data.activeUsers.daily * 0.95,
              'number'
            )}
          />
          <KpiCard
            kpi={formatKpi(
              'Weekly Active Users',
              engagement.data.activeUsers.weekly,
              engagement.data.activeUsers.weekly * 0.92,
              'number'
            )}
          />
          <KpiCard
            kpi={formatKpi(
              'Monthly Active Users',
              engagement.data.activeUsers.monthly,
              engagement.data.activeUsers.monthly * 0.88,
              'number'
            )}
          />
          <KpiCard
            kpi={formatKpi(
              'Bounce Rate',
              engagement.data.bounceRate,
              engagement.data.bounceRate * 1.1,
              'percentage'
            )}
          />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Geographic Distribution */}
        {geo.data && <GeoHeatmap data={geo.data} />}

        {/* Device Breakdown */}
        {devices.data && <DeviceBreakdown data={devices.data} />}
      </div>

      {/* Retention Cohorts */}
      {retention.data && <RetentionCohorts data={retention.data} />}
    </>
  );
}

function EngagementSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
