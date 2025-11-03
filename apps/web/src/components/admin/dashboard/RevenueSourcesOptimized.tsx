'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface RevenueSource {
  name: string;
  value: number;
  amount: number;
  color: string;
}

const REVENUE_SOURCES: RevenueSource[] = [
  { name: 'Abonnements', value: 45, amount: 56182, color: '#06b6d4' },
  { name: 'Messages privés', value: 28, amount: 34958, color: '#8b5cf6' },
  { name: 'Tips', value: 15, amount: 18728, color: '#10b981' },
  { name: 'PPV Photos/Vidéos', value: 8, amount: 9988, color: '#f59e0b' },
  { name: 'Lives', value: 4, amount: 4994, color: '#ec4899' },
];

export function RevenueSourcesOptimized() {
  const total = REVENUE_SOURCES.reduce((sum, source) => sum + source.amount, 0);

  // Cast data for recharts compatibility
  const chartData = REVENUE_SOURCES as any[];

  return (
    <Card className="transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Sources de Revenus</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="flex items-center gap-6 h-full">
          {/* Donut Chart */}
          <div className="flex-shrink-0">
            <ResponsiveContainer width={200} height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((source: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={source.color} className="cursor-pointer" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center text */}
            <div className="relative -mt-[140px] flex flex-col items-center justify-center h-[140px] pointer-events-none">
              <p className="text-xs text-gray-500 font-medium">Total</p>
              <p className="text-lg font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(total)}
              </p>
            </div>
          </div>

          {/* Legend inline */}
          <div className="flex-1 space-y-2">
            {REVENUE_SOURCES.map((source, index) => (
              <div
                key={source.name}
                className="flex items-center justify-between p-2 rounded-lg transition-all hover:bg-gray-50"
              >
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm text-gray-700 font-medium">{source.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{source.value}%</p>
                  <p className="text-xs text-gray-500">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0
                    }).format(source.amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
