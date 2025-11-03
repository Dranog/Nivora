'use client';

import { TrendingUp, Users, Percent, Euro } from 'lucide-react';
import type { KPI } from './types';

interface KPICardProps {
  kpi: KPI;
}

const ICON_MAP = {
  TrendingUp,
  Users,
  Percent,
  Euro,
} as const;

const COLOR_CLASSES = {
  blue: {
    bg: 'bg-blue-100',
    text: 'text-blue-600',
  },
  cyan: {
    bg: 'bg-cyan-100',
    text: 'text-cyan-600',
  },
  green: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-600',
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-600',
  },
} as const;

export function KPICard({ kpi }: KPICardProps) {
  const Icon = ICON_MAP[kpi.icon as keyof typeof ICON_MAP];
  const colorClass = COLOR_CLASSES[kpi.color];
  const isPositiveTrend = kpi.trend.startsWith('+');

  return (
    <div className="bg-white rounded-xl shadow p-6 relative">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-full ${colorClass.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colorClass.text}`} aria-hidden={true} />
        </div>
        <div
          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            isPositiveTrend
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {kpi.trend}
        </div>
      </div>

      <p className="text-4xl font-bold text-gray-900 mb-1">{kpi.value}</p>
      <p className="text-sm text-gray-600 font-medium">{kpi.label}</p>
    </div>
  );
}
