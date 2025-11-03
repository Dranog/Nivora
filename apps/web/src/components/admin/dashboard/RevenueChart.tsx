'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface Dataset {
  label: string;
  data: number[];
  color: string;
  change: number;
}

interface RevenueChartProps {
  labels: string[];
  datasets: Dataset[];
}

export function RevenueChart({ labels, datasets }: RevenueChartProps) {
  const chartData = labels.map((label, index) => {
    const dataPoint: Record<string, string | number> = { name: label };
    datasets.forEach((dataset) => {
      dataPoint[dataset.label] = dataset.data[index] || 0;
    });
    return dataPoint;
  });

  return (
    <Card className="shadow-card hover:shadow-lg transition-all duration-300 flex flex-col h-full border-gray-100/50" role="article" aria-label="Évolution des revenus">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold text-gray-900 mb-3">Évolution des Revenus</CardTitle>
        <div className="flex flex-wrap gap-3">
          {datasets.map((dataset) => (
            <div key={dataset.label} className="flex items-center gap-2 bg-gray-50/80 px-3 py-1.5 rounded-lg">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dataset.color }}
                aria-hidden={true}
              />
              <span className="text-xs font-medium text-gray-700">{dataset.label}</span>
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  dataset.change >= 0 ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-red-50 text-red-700 ring-1 ring-red-100'
                }`}
                aria-label={`Change: ${dataset.change >= 0 ? '+' : ''}${dataset.change}%`}
              >
                {dataset.change >= 0 ? '+' : ''}{dataset.change}%
              </span>
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 pb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              stroke="#D1D5DB"
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 12 }}
              stroke="#D1D5DB"
              axisLine={{ stroke: '#E5E7EB' }}
              tickFormatter={(value: number) => `€${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                fontSize: '12px',
                padding: '12px',
                boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)'
              }}
              formatter={(value: number) => [`€${value.toLocaleString('fr-FR')}`, '']}
              labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '16px' }}
              iconType="circle"
            />
            {datasets.map((dataset) => (
              <Line
                key={dataset.label}
                type="monotone"
                dataKey={dataset.label}
                stroke={dataset.color}
                strokeWidth={3}
                dot={{ fill: dataset.color, r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
