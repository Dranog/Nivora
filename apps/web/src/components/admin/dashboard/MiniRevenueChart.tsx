'use client';

import { Card } from '@/components/ui/card';
import { Sparkline } from './Sparkline';
import { TrendingUp } from 'lucide-react';

export function MiniRevenueChart() {
  const data = [45000, 48000, 46000, 52000, 55000, 53000, 58000];
  const current = data[data.length - 1];
  const previous = data[data.length - 2];
  const change = ((current - previous) / previous) * 100;

  return (
    <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-lg transition-all duration-300 border-gray-100/50" role="article" aria-label="Évolution 7 jours">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Évolution 7j</h3>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <p className="text-3xl font-bold bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0
            }).format(current)}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 ring-1 ring-emerald-100">
              <TrendingUp className="w-3 h-3 text-emerald-600" aria-hidden={true} />
              <span className="text-xs font-semibold text-emerald-700">+{change.toFixed(1)}%</span>
            </div>
          </div>
        </div>
        <div className="mt-4 h-16">
          <Sparkline
            data={data}
            width={200}
            height={64}
            color="#00B8A9"
          />
        </div>
      </div>
    </Card>
  );
}
