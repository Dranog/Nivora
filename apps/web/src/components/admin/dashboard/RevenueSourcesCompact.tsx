'use client';

import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RevenueSource {
  name: string;
  value: number;
  amount: number;
  color: string;
}

const REVENUE_SOURCES: RevenueSource[] = [
  { name: 'Abonnements', value: 45, amount: 56182, color: '#00B8A9' },
  { name: 'Messages', value: 28, amount: 34958, color: '#8b5cf6' },
  { name: 'Tips', value: 15, amount: 18728, color: '#10b981' },
  { name: 'PPV', value: 8, amount: 9988, color: '#f59e0b' },
  { name: 'Lives', value: 4, amount: 4994, color: '#ec4899' },
];

export function RevenueSourcesCompact() {
  const total = REVENUE_SOURCES.reduce((sum, source) => sum + source.amount, 0);
  const chartData = REVENUE_SOURCES as any;

  return (
    <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-lg transition-all duration-300 border-gray-100/50" role="article" aria-label="Sources de revenus">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Sources de Revenus</h3>
      <div className="flex-1 flex flex-col items-center">
        <div className="relative w-full" style={{ height: '140px' }}>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
              >
                {REVENUE_SOURCES.map((source, index) => (
                  <Cell key={`cell-${index}`} fill={source.color} className="cursor-pointer" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[10px] text-gray-500 font-medium">Total</p>
            <p className="text-sm font-bold text-gray-900">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0,
                notation: 'compact',
                compactDisplay: 'short'
              }).format(total)}
            </p>
          </div>
        </div>

        <div className="w-full space-y-1.5 mt-3">
          {REVENUE_SOURCES.map((source, index) => (
            <div
              key={source.name}
              className="flex items-center justify-between text-xs p-2 rounded-lg transition-colors hover:bg-gray-50/80"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: source.color }}
                  aria-hidden={true}
                />
                <span className="text-gray-700 font-medium truncate">{source.name}</span>
              </div>
              <span className="font-bold text-gray-900 ml-2">{source.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
