'use client';

import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { RevenueSource } from './types';

interface RevenueSourcesDonutProps {
  sources: RevenueSource[];
}

export function RevenueSourcesDonut({ sources }: RevenueSourcesDonutProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChartIcon className="w-5 h-5 text-gray-700" aria-hidden={true} />
        <h3 className="text-base font-semibold text-gray-900">Sources de Revenus</h3>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex-shrink-0">
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={sources}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {sources.map((source) => (
                  <Cell key={source.type} fill={source.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${value}%`}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-1 space-y-3">
          {sources.map((source) => (
            <div key={source.type} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-sm text-gray-700">{source.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(source.amount)}
                </p>
                <p className="text-xs text-gray-600">{source.value}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
