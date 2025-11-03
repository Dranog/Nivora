'use client';

import type { LiveStatsMetric, LiveStatsIconColor } from './types';

interface LiveStatsCardProps {
  stats: LiveStatsMetric[];
}

const ICON_COLOR_CLASSES: Record<LiveStatsIconColor, { bg: string; text: string }> = {
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
  },
};

const BADGE_VARIANT_CLASSES = {
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
};

export function LiveStatsCard({ stats }: LiveStatsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Lives</h3>

      <div className="space-y-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const iconColors = ICON_COLOR_CLASSES[stat.iconColor] || ICON_COLOR_CLASSES.cyan; // Fallback to cyan
          const badgeClass = BADGE_VARIANT_CLASSES[stat.badgeVariant] || BADGE_VARIANT_CLASSES.green; // Fallback to green

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-12 h-12 rounded-full ${iconColors.bg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${iconColors.text}`} aria-hidden={true} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass}`}>
                  {stat.badge}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
