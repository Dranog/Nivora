'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  formatCurrency,
  formatDate,
  getPeriodLabel,
  type SalesOverview,
  type SalesOverviewPeriod,
  type SalesDataPoint,
} from '@/types/dashboard';

interface SalesChartProps {
  data: SalesOverview | undefined;
  isLoading: boolean;
  period: SalesOverviewPeriod;
  onPeriodChange: (period: SalesOverviewPeriod) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !label) return null;

  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 text-sm font-medium text-foreground">
        {formatDate(label)}
      </p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <div
              className="h-3 w-3 rounded-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium text-foreground">
              {formatCurrency(entry.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SalesChart({
  data,
  isLoading,
  period,
  onPeriodChange,
}: SalesChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-10 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[350px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sales Overview</CardTitle>
          <Select value={period} onValueChange={onPeriodChange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            No data available for the selected period
          </div>
        </CardContent>
      </Card>
    );
  }

  const periods: Array<{ value: SalesOverviewPeriod; label: string }> = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div>
          <CardTitle className="mb-2">Sales Overview</CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div>
              Total:{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(data.total)}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div>
              Average:{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(data.average)}
              </span>
            </div>
            <div className="h-4 w-px bg-border" />
            <div>
              Peak:{' '}
              <span className="font-semibold text-foreground">
                {formatCurrency(data.peak.revenue)}
              </span>{' '}
              on {formatDate(data.peak.date)}
            </div>
          </div>
        </div>
        <Select
          value={period}
          onValueChange={(value) => onPeriodChange(value as SalesOverviewPeriod)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart
            data={data.data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A6A6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00A6A6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSubscriptions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPPV" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTips" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('fr-FR', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              className="text-xs text-muted-foreground"
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{
                paddingTop: '20px',
              }}
              iconType="circle"
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              name="Total Revenue"
              stroke="#00A6A6"
              strokeWidth={2}
              fill="url(#colorRevenue)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="subscriptions"
              name="Subscriptions"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorSubscriptions)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="ppv"
              name="PPV"
              stroke="#8b5cf6"
              strokeWidth={2}
              fill="url(#colorPPV)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="tips"
              name="Tips"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#colorTips)"
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
