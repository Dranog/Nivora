'use client';

import { Crown, Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import type { Creator } from './types';

interface TopCreatorsCardProps {
  creators: Creator[];
}

export function TopCreatorsCard({ creators }: TopCreatorsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Crown className="w-5 h-5 text-yellow-600" aria-hidden={true} />
        <h3 className="text-base font-semibold text-gray-900">Top Créateurs</h3>
      </div>

      <div className="space-y-4">
        {creators.map((creator, index) => {
          const chartData = creator.trend.map((value, idx) => ({
            index: idx,
            value,
          }));

          return (
            <div
              key={creator.id}
              className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {creator.avatar}
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {creator.name}
                  </p>
                  {creator.isHot && (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1 px-1.5 py-0">
                      <Flame className="w-3 h-3" aria-hidden={true} />
                      Hot
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600">@{creator.username}</p>
              </div>

              <div className="flex-shrink-0 w-20 h-10">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={creator.growth >= 0 ? '#10b981' : '#ef4444'}
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(creator.revenue)}
                </p>
                <div
                  className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${
                    creator.growth >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {creator.growth >= 0 ? (
                    <TrendingUp className="w-3 h-3" aria-hidden={true} />
                  ) : (
                    <TrendingDown className="w-3 h-3" aria-hidden={true} />
                  )}
                  {Math.abs(creator.growth)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
