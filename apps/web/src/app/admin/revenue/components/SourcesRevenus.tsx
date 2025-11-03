'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { RevenueSource } from '../types';

interface SourcesRevenusProps {
  sources: RevenueSource[];
}

export function SourcesRevenus({ sources }: SourcesRevenusProps) {
  const total = sources.reduce((sum, source) => sum + source.amount, 0);
  const chartData = sources;

  return (
    <Card className="col-span-12 lg:col-span-5 shadow-card border-gray-100/50">
      <div className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Sources de Revenus</h3>

        <div className="flex items-center gap-6">
          <div className="relative" style={{ width: '200px', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {sources.map((source, index) => (
                    <Cell key={`cell-${index}`} fill={source.color} className="cursor-pointer" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0,
                }).format(total)}
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {sources.map((source, index) => (
              <div
                key={source.name}
                className="flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-gray-50/80"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: source.color }}
                    aria-hidden={true}
                  />
                  <span className="text-sm font-medium text-gray-900">{source.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-900">{source.value}%</span>
                  <div className="flex items-center gap-1">
                    {source.trend >= 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-emerald-600" aria-hidden={true} />
                        <span className="text-xs font-semibold text-emerald-600">
                          +{source.trend.toFixed(1)}%
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-600" aria-hidden={true} />
                        <span className="text-xs font-semibold text-red-600">
                          {source.trend.toFixed(1)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
