'use client';

import { Star } from 'lucide-react';
import type { EngagementMetric, EngagementIconColor } from './types';

interface EngagementMetricsCardProps {
  metrics: EngagementMetric[];
}

const ICON_COLOR_CLASSES: Record<EngagementIconColor, { bg: string; text: string }> = {
  green: {
    bg: 'bg-green-100',
    text: 'text-green-600',
  },
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
  orange: {
    bg: 'bg-orange-100',
    text: 'text-orange-600',
  },
  pink: {
    bg: 'bg-pink-100',
    text: 'text-pink-600',
  },
};

const PROGRESS_BAR_COLORS: Record<EngagementIconColor, string> = {
  green: 'bg-green-500',
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
};

const BADGE_VARIANT_CLASSES = {
  green: 'bg-green-50 text-green-600',
  red: 'bg-red-50 text-red-600',
};

export function EngagementMetricsCard({ metrics }: EngagementMetricsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Métriques d'Engagement</h3>

      <div className="space-y-5">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const iconColors = ICON_COLOR_CLASSES[metric.iconColor] || ICON_COLOR_CLASSES.blue; // Fallback to blue
          const isLastMetric = index === metrics.length - 1;

          return (
            <div key={index}>
              <div className="flex items-start gap-3 mb-2">
                <div className={`w-10 h-10 rounded-full ${iconColors.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${iconColors.text}`} aria-hidden={true} />
                </div>
                <div className="flex-1">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-600">{metric.label}</p>
                </div>
              </div>

              {metric.progressBar !== undefined && (
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`${PROGRESS_BAR_COLORS[metric.iconColor] || PROGRESS_BAR_COLORS.blue} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${metric.progressBar}%` }}
                  />
                </div>
              )}

              {metric.badge && metric.badgeVariant && (
                <div className="mt-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${BADGE_VARIANT_CLASSES[metric.badgeVariant]}`}>
                    {metric.badge}
                  </span>
                </div>
              )}

              {isLastMetric && (
                <div className="flex items-center gap-0.5 mt-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <Star className="w-4 h-4 fill-yellow-400/50 text-yellow-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
