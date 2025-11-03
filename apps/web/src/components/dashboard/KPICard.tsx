'use client';

import { TrendingUp, Users, Percent, Euro, DollarSign, Video, AlertCircle } from 'lucide-react';
import type { KPIData, IconColor } from './types';

interface KPICardProps {
  data: KPIData;
}

const ICON_MAP = {
  TrendingUp,
  Users,
  Percent,
  Euro,
  DollarSign,
  Video,
  AlertCircle,
} as const;

const COLOR_CLASSES: Record<IconColor, { bg: string; badge: string }> = {
  blue: {
    bg: 'bg-blue-100',
    badge: 'bg-blue-50 text-blue-600',
  },
  cyan: {
    bg: 'bg-cyan-100',
    badge: 'bg-cyan-50 text-cyan-600',
  },
  green: {
    bg: 'bg-emerald-100',
    badge: 'bg-emerald-50 text-emerald-600',
  },
  purple: {
    bg: 'bg-purple-100',
    badge: 'bg-purple-50 text-purple-600',
  },
};

export function KPICard({ data }: KPICardProps) {
  const Icon = ICON_MAP[data.icon as keyof typeof ICON_MAP];
  const colors = COLOR_CLASSES[data.iconColor] || COLOR_CLASSES.blue; // Fallback to blue if undefined

  // Guard: If Icon is undefined, use a fallback
  const IconComponent = Icon || TrendingUp;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-full ${colors.bg} flex items-center justify-center`}>
          <IconComponent className="w-6 h-6 text-gray-700" aria-hidden={true} />
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.badge}`}>
          {data.trend}
        </div>
      </div>
      <p className="text-4xl font-bold text-gray-900 mb-1">{data.value}</p>
      <p className="text-sm text-gray-600">{data.label}</p>
    </div>
  );
}
