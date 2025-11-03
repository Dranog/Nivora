'use client';

import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { RevenueEvolutionDataPoint } from '../types';

interface EvolutionRevenusProps {
  data: RevenueEvolutionDataPoint[];
}

const LINES_CONFIG = [
  { key: 'revenus_bruts', label: 'Revenus bruts', color: '#00B8A9', trend: '+76%' },
  { key: 'ppv_achats', label: 'PPV/Achats', color: '#3b82f6', trend: '+11%' },
  { key: 'tips', label: 'Tips', color: '#8b5cf6', trend: '+10%' },
  { key: 'marketplace', label: 'Marketplace', color: '#f59e0b', trend: '+5%' },
];

export function EvolutionRevenus({ data }: EvolutionRevenusProps) {
  return (
    <Card className="col-span-12 lg:col-span-5 shadow-card border-gray-100/50">
      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 mb-3">Evolution Revenus</h3>
          <div className="flex flex-wrap gap-3">
            {LINES_CONFIG.map((line) => (
              <div key={line.key} className="flex items-center gap-2 bg-gray-50/80 px-3 py-1.5 rounded-lg">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: line.color }}
                  aria-hidden={true}
                />
                <span className="text-xs font-medium text-gray-700">{line.label}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                  {line.trend}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="date"
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
                  boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
                }}
                formatter={(value: number) => [`€${value.toLocaleString('fr-FR')}`, '']}
                labelStyle={{ fontWeight: 600, color: '#111827', marginBottom: '4px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '8px' }} iconType="circle" />
              {LINES_CONFIG.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={{ fill: line.color, r: 4, strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
