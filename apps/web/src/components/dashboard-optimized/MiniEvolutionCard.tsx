'use client';

import { TrendingUp } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniEvolutionCardProps {
  current: number;
  growth: number;
  data: number[];
}

export function MiniEvolutionCard({ current, growth, data }: MiniEvolutionCardProps) {
  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-gray-700" aria-hidden={true} />
        <h3 className="text-base font-semibold text-gray-900">Évolution 7j</h3>
      </div>

      <div className="mb-4">
        <p className="text-3xl font-bold text-gray-900">
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(current)}
        </p>
        <p className="text-sm text-emerald-600 font-semibold mt-1">
          +{growth}% vs semaine dernière
        </p>
      </div>

      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
