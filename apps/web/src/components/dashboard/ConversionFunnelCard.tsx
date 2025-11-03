'use client';

import type { FunnelStep } from './types';

interface ConversionFunnelCardProps {
  steps: FunnelStep[];
}

const GRADIENT_COLORS = [
  'from-cyan-500 to-cyan-600',
  'from-cyan-600 to-blue-500',
  'from-blue-500 to-purple-500',
  'from-purple-500 to-purple-600',
  'from-purple-600 to-purple-700',
];

export function ConversionFunnelCard({ steps }: ConversionFunnelCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Funnel de Conversion</h3>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isFirst = index === 0;
          const conversionRate = index > 0 ? (step.value / steps[index - 1].value) * 100 : 100;

          return (
            <div key={index}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-gray-700">{step.label}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900">
                    {new Intl.NumberFormat('fr-FR').format(step.value)}
                  </span>
                  {!isFirst && (
                    <span className="text-xs text-gray-600">
                      {conversionRate.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="relative h-8">
                <div
                  className={`h-full rounded-lg bg-gradient-to-r ${GRADIENT_COLORS[index]} transition-all duration-500`}
                  style={{ width: `${step.percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
