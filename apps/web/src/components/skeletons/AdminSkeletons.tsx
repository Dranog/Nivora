/**
 * Specialized Skeleton Components for Admin Panel
 * Reusable loading states for common patterns
 */

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// ============================================================================
// KPI CARD SKELETON
// ============================================================================

export function KpiCardSkeleton() {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-28" />
    </Card>
  );
}

export function KpiGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// TABLE SKELETON
// ============================================================================

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="border-b bg-muted/30 p-3">
        <div className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-24" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-3">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-20" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="border-t bg-muted/30 p-3 flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CHART SKELETON
// ============================================================================

export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-4" />
      <Skeleton className={`h-[${height}px] w-full`} />
    </Card>
  );
}

export function ChartGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ChartSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================================
// LIST SKELETON
// ============================================================================

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg">
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-20" />
    </div>
  );
}

export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <Card className="p-4">
      <Skeleton className="h-6 w-40 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: items }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </div>
    </Card>
  );
}

// ============================================================================
// FORM SKELETON
// ============================================================================

export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-48 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </Card>
  );
}

// ============================================================================
// DETAIL VIEW SKELETON
// ============================================================================

export function DetailHeaderSkeleton() {
  return (
    <div className="flex items-start gap-4 mb-6">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-2 mt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

export function DetailSectionSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-5 w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DetailViewSkeleton() {
  return (
    <div className="space-y-6">
      <DetailHeaderSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DetailSectionSkeleton />
        <DetailSectionSkeleton />
      </div>
      <DetailSectionSkeleton />
    </div>
  );
}

// ============================================================================
// TABS SKELETON
// ============================================================================

export function TabsSkeleton({ tabs = 4 }: { tabs?: number }) {
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {Array.from({ length: tabs }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32 rounded-t-lg" />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <KpiGridSkeleton count={4} />
        <ChartGridSkeleton count={2} />
      </div>
    </div>
  );
}

// ============================================================================
// PAGE SKELETON (FULL PAGE)
// ============================================================================

export function PageSkeleton({
  showHeader = true,
  showKpis = true,
  showCharts = false,
  showTable = true,
}: {
  showHeader?: boolean;
  showKpis?: boolean;
  showCharts?: boolean;
  showTable?: boolean;
}) {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      )}

      {/* KPIs */}
      {showKpis && <KpiGridSkeleton />}

      {/* Charts */}
      {showCharts && <ChartGridSkeleton />}

      {/* Table */}
      {showTable && <TableSkeleton />}
    </div>
  );
}

// ============================================================================
// DASHBOARD SKELETON
// ============================================================================

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* KPIs */}
      <KpiGridSkeleton count={4} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TableSkeleton rows={5} columns={5} />
        </div>
        <ListSkeleton items={6} />
      </div>
    </div>
  );
}

// ============================================================================
// ANALYTICS SKELETON
// ============================================================================

export function AnalyticsSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-48" />
        </div>
      </Card>

      {/* Tabs */}
      <TabsSkeleton tabs={4} />
    </div>
  );
}

// ============================================================================
// MODERATION SKELETON
// ============================================================================

export function ModerationSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Stats */}
      <KpiGridSkeleton count={5} />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>
      </Card>

      {/* Table */}
      <TableSkeleton rows={10} columns={7} />
    </div>
  );
}

// ============================================================================
// USER DETAIL SKELETON
// ============================================================================

export function UserDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <DetailHeaderSkeleton />

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <KpiGridSkeleton count={4} />
          <ChartSkeleton />
          <TableSkeleton rows={5} />
        </div>
        <div className="space-y-6">
          <DetailSectionSkeleton />
          <ListSkeleton items={5} />
        </div>
      </div>
    </div>
  );
}
