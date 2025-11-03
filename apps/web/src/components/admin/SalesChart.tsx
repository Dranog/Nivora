'use client';

import { useTranslations } from 'next-intl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function SalesChart() {
  const t = useTranslations('admin.dashboard');

  const DEMO_DATA = [
    { monthKey: 'march', value: 4200 },
    { monthKey: 'april', value: 5500 },
    { monthKey: 'may', value: 7800 },
  ];

  // Transform data with translated months
  const chartData = DEMO_DATA.map((item) => ({
    month: t(`months.${item.monthKey}`),
    value: item.value,
  }));

  // Capture translated label for tooltip (must be outside JSX for proper closure)
  const revenueLabel = t('chart.revenue');

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
        <XAxis
          dataKey="month"
          tick={{ fill: '#6B7280', fontSize: 12 }}
        />
        <YAxis
          tick={{ fill: '#6B7280', fontSize: 12 }}
          tickFormatter={(value) => `€${value}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
          formatter={(value: number) => [`€${value}`, revenueLabel]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#00B8A9"
          strokeWidth={3}
          dot={{ fill: '#00B8A9', r: 5 }}
          activeDot={{ r: 7 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
