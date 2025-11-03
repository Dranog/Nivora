'use client';

import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface Creator {
  name: string;
  username: string;
  avatar: string;
  revenue: number;
  verified: boolean;
}

const TOP_CREATORS_DATA: Creator[] = [
  {
    name: 'Sophie Martin',
    username: 'sophiem',
    avatar: 'SM',
    revenue: 8450,
    verified: true
  },
  {
    name: 'Lucas Bernard',
    username: 'lucasb',
    avatar: 'LB',
    revenue: 7280,
    verified: true
  },
  {
    name: 'Emma Dubois',
    username: 'emmad',
    avatar: 'ED',
    revenue: 6950,
    verified: false
  },
  {
    name: 'Thomas Petit',
    username: 'thomasp',
    avatar: 'TP',
    revenue: 6120,
    verified: true
  },
  {
    name: 'Léa Moreau',
    username: 'leam',
    avatar: 'LM',
    revenue: 5840,
    verified: false
  },
];

export function TopCreatorsCompact() {
  return (
    <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-lg transition-all duration-300 border-gray-100/50" role="article" aria-label="Top créateurs">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Créateurs</h3>
      <div className="space-y-2.5 flex-1 overflow-auto">
        {TOP_CREATORS_DATA.map((creator, idx) => (
          <div
            key={creator.username}
            className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50/80 transition-colors"
          >
            <span className="text-gray-500 text-xs font-semibold w-4 flex-shrink-0">
              {idx + 1}
            </span>

            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-start to-brand-end flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {creator.avatar}
              </div>
              {creator.verified && (
                <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 text-brand-600 bg-white rounded-full" aria-label="Verified creator" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs text-gray-900 truncate">{creator.name}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-bold text-xs text-gray-900">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(creator.revenue)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
