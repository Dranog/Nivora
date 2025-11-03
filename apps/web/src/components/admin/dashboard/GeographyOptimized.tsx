'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkline } from './Sparkline';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CountryData {
  country: string;
  flag: string;
  users: number;
  percent: number;
  trend: number[];
  growth: number;
}

const GEOGRAPHY_DATA: CountryData[] = [
  { country: 'France', flag: '🇫🇷', users: 1240, percent: 42, trend: [800, 850, 920, 1050, 1120, 1180, 1240], growth: 12 },
  { country: 'États-Unis', flag: '🇺🇸', users: 890, percent: 31, trend: [720, 750, 780, 820, 850, 870, 890], growth: 8 },
  { country: 'Canada', flag: '🇨🇦', users: 450, percent: 15, trend: [380, 390, 410, 420, 430, 440, 450], growth: 5 },
  { country: 'Belgique', flag: '🇧🇪', users: 280, percent: 9, trend: [240, 245, 255, 260, 270, 275, 280], growth: 4 },
  { country: 'Suisse', flag: '🇨🇭', users: 85, percent: 3, trend: [95, 92, 90, 88, 87, 86, 85], growth: -2 },
];

export function GeographyOptimized() {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Géographie Top Pays</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        <div className="space-y-3">
          {GEOGRAPHY_DATA.map((item) => (
            <div
              key={item.country}
              className="group p-3 rounded-lg border border-gray-100 hover:border-cyan-200 hover:bg-cyan-50/30 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl" aria-label={`Drapeau ${item.country}`}>
                  {item.flag}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{item.country}</span>
                    <div className="flex items-center gap-2">
                      <Sparkline data={item.trend} width={50} height={16} color="#06b6d4" />
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                        item.growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {item.growth >= 0 ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {Math.abs(item.growth)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-cyan-500 to-cyan-600 transition-all duration-500"
                  style={{ width: `${item.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-600">
                  {item.users.toLocaleString('fr-FR')} utilisateurs
                </span>
                <span className="text-xs font-semibold text-gray-700">{item.percent}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
