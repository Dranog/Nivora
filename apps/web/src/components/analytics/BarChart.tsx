/**
 * Bar Chart Component (F10)
 * Bar chart for categorical data using recharts
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DataPoint {
  name: string;
  [key: string]: string | number;
}

interface BarSeries {
  dataKey: string;
  name: string;
  color: string;
}

interface BarChartProps {
  title: string;
  data: DataPoint[];
  series: BarSeries[];
  className?: string;
  valueFormatter?: (value: number) => string;
  layout?: 'horizontal' | 'vertical';
}

export function BarChart({
  title,
  data,
  series,
  className,
  valueFormatter = (value) => value.toLocaleString(),
  layout = 'vertical',
}: BarChartProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300} aria-label={`${title} chart`}>
          <RechartsBarChart
            data={data}
            layout={layout}
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            {layout === 'vertical' ? (
              <>
                <XAxis type="number" tick={{ fontSize: 12 }} tickFormatter={valueFormatter} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={valueFormatter} />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
              }}
              formatter={valueFormatter}
            />
            {series.length > 1 && <Legend />}
            {series.map((s) => (
              <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name} fill={s.color} radius={4} />
            ))}
          </RechartsBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
