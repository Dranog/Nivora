/**
 * KPI Card Component (F10)
 * Displays a single KPI metric with trend indicator
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalyticsKpi } from '@/types/analytics';

interface KpiCardProps {
  kpi: AnalyticsKpi;
  className?: string;
}

export function KpiCard({ kpi, className }: KpiCardProps) {
  const { label, value, change, trend, format } = kpi;

  // Format the value based on the format type
  const formattedValue = formatValue(value, format);
  const formattedChange = Math.abs(change).toFixed(1);

  // Trend icon and color
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor =
    trend === 'up'
      ? 'text-green-600 dark:text-green-400'
      : trend === 'down'
      ? 'text-red-600 dark:text-red-400'
      : 'text-muted-foreground';

  const trendBgColor =
    trend === 'up'
      ? 'bg-green-50 dark:bg-green-950'
      : trend === 'down'
      ? 'bg-red-50 dark:bg-red-950'
      : 'bg-muted';

  // Descriptive text for screen readers
  const trendDescription =
    trend === 'up'
      ? `up ${formattedChange}% from previous period`
      : trend === 'down'
      ? `down ${formattedChange}% from previous period`
      : 'no significant change from previous period';

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline justify-between">
          <div>
            <div
              className="text-2xl font-bold"
              aria-label={`${label}: ${formattedValue}`}
            >
              {formattedValue}
            </div>
          </div>

          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trendBgColor,
              trendColor
            )}
            aria-describedby={`${label}-trend-description`}
          >
            <TrendIcon className="h-3 w-3" aria-hidden={true} />
            <span>{formattedChange}%</span>
          </div>
        </div>

        {/* Hidden description for screen readers */}
        <span id={`${label}-trend-description`} className="sr-only">
          {label} is {trendDescription}
        </span>
      </CardContent>
    </Card>
  );
}

/**
 * Format value based on type
 */
function formatValue(value: number, format: 'number' | 'currency' | 'percentage'): string {
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

    case 'percentage':
      return `${value.toFixed(1)}%`;

    case 'number':
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
}

// ============================================================================
// Calculated KPI Helpers
// ============================================================================

/**
 * Calculate ARPU (Average Revenue Per User)
 */
export function calculateARPU(totalRevenue: number, totalUsers: number): number {
  return totalUsers > 0 ? totalRevenue / totalUsers : 0;
}

/**
 * Calculate Conversion Rate
 */
export function calculateConversionRate(conversions: number, totalVisitors: number): number {
  return totalVisitors > 0 ? (conversions / totalVisitors) * 100 : 0;
}

/**
 * Calculate Churn Rate
 */
export function calculateChurnRate(churnedUsers: number, totalUsers: number): number {
  return totalUsers > 0 ? (churnedUsers / totalUsers) * 100 : 0;
}

/**
 * Calculate MRR (Monthly Recurring Revenue)
 */
export function calculateMRR(activeSubscriptions: { price: number }[]): number {
  return activeSubscriptions.reduce((total, sub) => total + sub.price, 0);
}

/**
 * Calculate LTV (Lifetime Value)
 */
export function calculateLTV(arpu: number, averageLifetimeMonths: number, churnRate: number): number {
  if (churnRate === 0) return arpu * averageLifetimeMonths;
  return arpu * (1 / (churnRate / 100));
}
