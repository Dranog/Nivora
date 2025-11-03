'use client';

import { Users, TrendingUp, LifeBuoy, Percent } from 'lucide-react';

interface QuickStats {
  activeCreators: number;
  conversionRate: number;
  retentionRate: number;
  openTickets: number;
}

interface QuickStatsGridProps {
  stats: QuickStats;
}

export function QuickStatsGrid({ stats }: QuickStatsGridProps) {
  const quickStatsData = [
    {
      label: 'Créateurs Actifs',
      value: stats.activeCreators.toLocaleString('fr-FR'),
      icon: Users,
      color: 'text-cyan-600'
    },
    {
      label: 'Taux Conversion',
      value: `${stats.conversionRate}%`,
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Taux Rétention',
      value: `${stats.retentionRate}%`,
      icon: Percent,
      color: 'text-blue-600'
    },
    {
      label: 'Tickets Support',
      value: stats.openTickets.toString(),
      icon: LifeBuoy,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {quickStatsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all p-4"
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${stat.color}`} aria-hidden={true} />
              <div>
                <p className="text-xs text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
