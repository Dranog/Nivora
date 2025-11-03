'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { RevenueSource } from './types';

interface SourcesRevenusCardProps {
  sources: RevenueSource[];
}

export function SourcesRevenusCard({ sources }: SourcesRevenusCardProps) {
  const total = 12450;

  return (
    <div className="col-span-12 lg:col-span-5 bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Sources de Revenus</h3>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        <div className="relative">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={sources}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="percentage"
              >
                {sources.map((source, index) => (
                  <Cell key={`cell-${index}`} fill={source.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-xl font-bold text-gray-900">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
                notation: 'compact',
              }).format(total)}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {sources.map((source) => (
            <div key={source.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: source.color }}
                  aria-hidden={true}
                />
                <span className="text-sm text-gray-700">{source.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {source.percentage}%
                </span>
                <div className="flex items-center gap-1">
                  {source.trend >= 0 ? (
                    <>
                      <TrendingUp className="w-3 h-3 text-emerald-500" aria-hidden={true} />
                      <span className="text-xs text-emerald-500">↑ {source.trend}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 text-red-500" aria-hidden={true} />
                      <span className="text-xs text-red-500">↓ {Math.abs(source.trend)}%</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
