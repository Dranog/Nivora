'use client';

import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Badge } from '@/components/ui/badge';
import type { Creator } from './types';

interface TopCreatorsCardProps {
  creators: Creator[];
}

export function TopCreatorsCard({ creators }: TopCreatorsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Top Créateurs</h3>

      <div className="space-y-3">
        {creators.map((creator) => {
          const chartData = creator.sparklineData.map((value, index) => ({
            index,
            value,
          }));

          return (
            <div
              key={creator.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {creator.avatar}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {creator.name}
                </p>
                <p className="text-xs text-gray-600">@{creator.username}</p>
              </div>

              {chartData.length > 0 && (
                <div className="w-24 h-10 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id={`gradient-${creator.id}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        fill={`url(#gradient-${creator.id})`}
                        dot={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold text-gray-900">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(creator.amount)}
                </p>
                <p
                  className={`text-xs font-semibold ${
                    creator.trend >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}
                >
                  {creator.trend >= 0 ? '+' : ''}
                  {creator.trend}%
                </p>
              </div>

              {creator.isHot && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 flex-shrink-0">
                  Hot
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
