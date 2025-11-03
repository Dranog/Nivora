'use client';

import { useState } from 'react';
import { Users, UserPlus, CheckCircle, ShoppingCart, Star } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FunnelStep {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
}

const FUNNEL_DATA: FunnelStep[] = [
  { label: 'Visiteurs', value: 10000, icon: Users, color: '#3b82f6' },
  { label: 'Inscriptions', value: 3200, icon: UserPlus, color: '#06b6d4' },
  { label: 'Profil complété', value: 2400, icon: CheckCircle, color: '#8b5cf6' },
  { label: 'Premier achat', value: 1100, icon: ShoppingCart, color: '#10b981' },
  { label: 'Abonnés actifs', value: 850, icon: Star, color: '#ec4899' },
];

export function ConversionFunnelOptimized() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxValue = FUNNEL_DATA[0].value;

  return (
    <Card className="transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span>Funnel de Conversion</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        <div className="space-y-2">
          {FUNNEL_DATA.map((step, index) => {
            const widthPercent = (step.value / maxValue) * 100;
            const nextStep = FUNNEL_DATA[index + 1];
            const conversionRate = nextStep ? ((nextStep.value / step.value) * 100).toFixed(1) : null;
            const dropOffRate = nextStep ? (((step.value - nextStep.value) / step.value) * 100).toFixed(1) : null;
            const Icon = step.icon;

            return (
              <div key={step.label}>
                <div
                  className="relative group cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {/* Trapezoid using clip-path */}
                  <div className="relative h-14 flex items-center">
                    <div
                      className="absolute left-0 h-full transition-all duration-300"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: step.color,
                        clipPath: index === FUNNEL_DATA.length - 1
                          ? 'polygon(0 0, 100% 0, 95% 100%, 0 100%)'
                          : 'polygon(0 0, 100% 0, 90% 100%, 0 100%)',
                        opacity: hoveredIndex === index ? 0.9 : 0.8,
                      }}
                    />

                    {/* Content overlay */}
                    <div className="relative z-10 flex items-center justify-between w-full px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{step.label}</p>
                          <p className="text-xs text-white/80">
                            {step.value.toLocaleString('fr-FR')} ({((step.value / maxValue) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      </div>

                      {dropOffRate && (
                        <div className="text-right">
                          <p className="text-xs text-white/90 font-medium">Drop: {dropOffRate}%</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tooltip on hover */}
                  {hoveredIndex === index && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-gray-900 text-white px-3 py-2 rounded-lg text-xs whitespace-nowrap z-20 shadow-lg">
                      {conversionRate && `Taux de conversion: ${conversionRate}%`}
                      {!conversionRate && 'Dernière étape'}
                      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
                    </div>
                  )}
                </div>

                {/* Arrow between steps */}
                {index < FUNNEL_DATA.length - 1 && (
                  <div className="flex justify-center my-1">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
