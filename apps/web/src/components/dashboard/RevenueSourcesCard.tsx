'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { RevenueSource } from './types';

interface RevenueSourcesCardProps {
  sources: RevenueSource[];
}

export function RevenueSourcesCard({ sources }: RevenueSourcesCardProps) {
  const total = sources.reduce((sum, source) => sum + source.value, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Sources de Revenus</h3>

      <div className="flex items-center gap-8">
        <div className="flex-shrink-0 relative">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={sources}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
              >
                {sources.map((source) => (
                  <Cell key={source.name} fill={source.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Intl.NumberFormat('fr-FR', {
                notation: 'compact',
                compactDisplay: 'short',
              }).format(total)}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-sm text-gray-700">{source.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {source.percentage}%
                </p>
                <p className="text-xs text-gray-600">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(source.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
