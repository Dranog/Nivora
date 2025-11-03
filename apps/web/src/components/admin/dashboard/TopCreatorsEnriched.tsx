'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkline } from './Sparkline';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Creator {
  name: string;
  username: string;
  avatar: string;
  revenue: number;
  trend: number[];
  growth: number;
  verified: boolean;
}

const TOP_CREATORS_DATA: Creator[] = [
  {
    name: 'Sophie Martin',
    username: 'sophiem',
    avatar: 'SM',
    revenue: 8450,
    trend: [6200, 6800, 7100, 7500, 7900, 8200, 8450],
    growth: 15,
    verified: true
  },
  {
    name: 'Lucas Bernard',
    username: 'lucasb',
    avatar: 'LB',
    revenue: 7280,
    trend: [6800, 6900, 7000, 7100, 7150, 7200, 7280],
    growth: 8,
    verified: true
  },
  {
    name: 'Emma Dubois',
    username: 'emmad',
    avatar: 'ED',
    revenue: 6950,
    trend: [5500, 5800, 6100, 6400, 6600, 6800, 6950],
    growth: 22,
    verified: false
  },
  {
    name: 'Thomas Petit',
    username: 'thomasp',
    avatar: 'TP',
    revenue: 6120,
    trend: [5900, 5950, 6000, 6050, 6080, 6100, 6120],
    growth: 4,
    verified: true
  },
  {
    name: 'Léa Moreau',
    username: 'leam',
    avatar: 'LM',
    revenue: 5840,
    trend: [6200, 6100, 6000, 5950, 5900, 5870, 5840],
    growth: -3,
    verified: false
  },
];

export function TopCreatorsEnriched() {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Top Créateurs</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        <div className="space-y-2">
          {TOP_CREATORS_DATA.map((creator, idx) => (
            <div
              key={creator.username}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Rank */}
              <span className="text-muted-foreground text-sm font-medium w-6 flex-shrink-0">
                {idx + 1}
              </span>

              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                  {creator.avatar}
                </div>
                {creator.verified && (
                  <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 w-4 h-4 text-cyan-600 bg-white rounded-full" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm truncate">{creator.name}</p>
                  {creator.growth > 10 && (
                    <Badge variant="secondary" className="text-xs py-0 px-1.5 h-5">Hot</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{creator.username}</p>
              </div>

              {/* Sparkline - Plus grande */}
              <div className="w-20 h-8 flex-shrink-0">
                <Sparkline
                  data={creator.trend}
                  width={80}
                  height={32}
                  color={creator.growth >= 0 ? '#10b981' : '#ef4444'}
                />
              </div>

              {/* Growth */}
              <div className="text-right flex-shrink-0 w-12">
                <p className={cn(
                  "text-xs font-medium",
                  creator.growth >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {creator.growth >= 0 ? '+' : ''}{creator.growth}%
                </p>
              </div>

              {/* Revenue */}
              <div className="text-right flex-shrink-0 w-20">
                <p className="font-semibold text-sm">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(creator.revenue)}
                </p>
                <p className="text-xs text-muted-foreground">ce mois</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
