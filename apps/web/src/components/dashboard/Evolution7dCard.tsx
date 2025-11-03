'use client';

import { LineChart, Line, ResponsiveContainer } from 'recharts';
import type { Evolution7dData } from './types';

interface Evolution7dCardProps {
  data: Evolution7dData;
}

export function Evolution7dCard({ data }: Evolution7dCardProps) {
  const chartData = data.sparklineData.map((value, index) => ({
    index,
    value,
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Évolution 7j</h3>

      <p className="text-5xl font-bold text-cyan-600 mb-2">
        {new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(data.current)}
      </p>

      <p className="text-sm text-emerald-600 font-semibold mb-4">
        +{data.growth}% vs semaine précédente
      </p>

      <ResponsiveContainer width="100%" height={80}>
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
