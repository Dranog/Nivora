'use client';

import { Card } from '@/components/ui/card';

interface Country {
  code: string;
  name: string;
  flag: string;
  percentage: number;
  users: number;
}

const COUNTRIES: Country[] = [
  { code: 'FR', name: 'France', flag: '🇫🇷', percentage: 45, users: 12450 },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', percentage: 18, users: 4980 },
  { code: 'CH', name: 'Suisse', flag: '🇨🇭', percentage: 15, users: 4150 },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', percentage: 12, users: 3320 },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', percentage: 10, users: 2770 },
];

export function GeographyCompact() {
  return (
    <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-lg transition-all duration-300 border-gray-100/50" role="article" aria-label="Géographie top 5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Géographie Top 5</h3>
      <div className="space-y-3 flex-1">
        {COUNTRIES.map((country) => (
          <div key={country.code} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className="text-lg leading-none" aria-hidden={true}>{country.flag}</span>
                <span className="text-xs font-semibold text-gray-900 truncate">
                  {country.name}
                </span>
              </div>
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="text-xs text-gray-500 font-medium">
                  {country.users.toLocaleString('fr-FR')}
                </span>
                <span className="text-xs font-bold text-gray-900 w-10 text-right">
                  {country.percentage}%
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-brand-start to-brand-end h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${country.percentage}%` }}
                role="progressbar"
                aria-valuenow={country.percentage}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${country.name}: ${country.percentage}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
