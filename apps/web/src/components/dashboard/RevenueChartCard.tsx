'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { RevenueDataPoint } from './types';

interface RevenueChartCardProps {
  data: RevenueDataPoint[];
}

const LEGEND_ITEMS = [
  { key: 'revenus', label: 'Revenus bruts', color: '#06b6d4', trend: '+76%' },
  { key: 'ppv', label: 'PPV', color: '#3b82f6', trend: '+11%' },
  { key: 'tips', label: 'Tips', color: '#8b5cf6', trend: '+10%' },
  { key: 'marketplace', label: 'Marketplace', color: '#f59e0b', trend: '-5%' },
];

export function RevenueChartCard({ data }: RevenueChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900">Évolution des Revenus</h3>

        <div className="flex items-center gap-4">
          {LEGEND_ITEMS.map((item) => (
            <div key={item.key} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-gray-700">{item.label}</span>
              <span
                className={`text-xs font-semibold ${
                  item.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {item.trend}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            tickFormatter={(value) =>
              new Intl.NumberFormat('fr-FR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(value)
            }
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
            formatter={(value: number) =>
              new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
              }).format(value)
            }
          />
          <Line
            type="monotone"
            dataKey="revenus"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ fill: '#06b6d4', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="ppv"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="tips"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="marketplace"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ fill: '#f59e0b', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
