'use client';

import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingDown } from 'lucide-react';
import type { EvolutionDataPoint } from './types';

interface EvolutionRevenusCardProps {
  data: EvolutionDataPoint[];
}

export function EvolutionRevenusCard({ data }: EvolutionRevenusCardProps) {
  return (
    <div className="col-span-12 lg:col-span-5 bg-white rounded-xl shadow-lg p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 mb-3">Evolution Revenus</h3>
        <div className="flex flex-wrap gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-500" aria-hidden={true} />
            <span className="text-gray-700">Revenus bruts</span>
            <span className="font-semibold text-emerald-600">+76%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" aria-hidden={true} />
            <span className="text-gray-700">PPV/Achats</span>
            <span className="font-semibold text-emerald-600">+11%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" aria-hidden={true} />
            <span className="text-gray-700">Tips/Pourboires</span>
            <span className="font-semibold text-emerald-600">+10%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" aria-hidden={true} />
            <span className="text-gray-700">Marketplace</span>
            <span className="font-semibold text-gray-700">5%</span>
            <TrendingDown className="w-3 h-3 text-red-500" aria-hidden={true} />
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid stroke="#f0f0f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [
              `€${value.toLocaleString('fr-FR')}`,
              '',
            ]}
          />
          <Line
            type="monotone"
            dataKey="revenus_bruts"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={{ fill: '#06b6d4', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="ppv_achats"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="tips"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="marketplace"
            stroke="#f97316"
            strokeWidth={2}
            dot={{ fill: '#f97316', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
