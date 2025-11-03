'use client';

import { Card } from '@/components/ui/card';

interface FunnelStep {
  name: string;
  count: number;
  percentage: number;
}

const FUNNEL_STEPS: FunnelStep[] = [
  { name: 'Visiteurs', count: 45200, percentage: 100 },
  { name: 'Inscriptions', count: 15600, percentage: 34.5 },
  { name: 'Profils vus', count: 8920, percentage: 57.2 },
  { name: 'Abonnements', count: 3580, percentage: 40.1 },
  { name: 'Achats PPV', count: 1240, percentage: 34.6 },
];

export function ConversionFunnelCompact() {
  return (
    <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-lg transition-all duration-300 border-gray-100/50" role="article" aria-label="Funnel de conversion">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Funnel de Conversion</h3>
      <div className="flex-1 space-y-3">
        {FUNNEL_STEPS.map((step, idx) => {
          const isFirst = idx === 0;
          const dropRate = idx > 0 ? 100 - step.percentage : 0;

          return (
            <div key={step.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-900">{step.name}</span>
                <span className="text-gray-500 font-medium">
                  {step.count.toLocaleString('fr-FR')}
                </span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-100 rounded-full h-6 flex items-center justify-end pr-2.5 overflow-hidden">
                  <div
                    className={`absolute left-0 top-0 h-6 rounded-full transition-all duration-500 ease-out ${
                      isFirst
                        ? 'bg-gradient-to-r from-brand-start to-brand-end'
                        : dropRate < 30
                          ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                          : dropRate < 50
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                            : 'bg-gradient-to-r from-orange-400 to-orange-500'
                    }`}
                    style={{ width: `${step.percentage}%` }}
                    role="progressbar"
                    aria-valuenow={step.percentage}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${step.name}: ${step.percentage}%`}
                  />
                  <span className="relative z-10 text-[10px] font-bold text-gray-700">
                    {step.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              {!isFirst && dropRate > 0 && (
                <div className="flex items-center justify-end text-[10px] text-red-600 font-medium">
                  <span>-{dropRate.toFixed(0)}% vs précédent</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
