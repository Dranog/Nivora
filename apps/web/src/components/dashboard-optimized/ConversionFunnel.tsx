'use client';

import { Filter } from 'lucide-react';
import type { FunnelStep } from './types';

interface ConversionFunnelProps {
  steps: FunnelStep[];
}

export function ConversionFunnel({ steps }: ConversionFunnelProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-gray-700" aria-hidden={true} />
        <h3 className="text-base font-semibold text-gray-900">Funnel de Conversion</h3>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const isFirst = index === 0;
          const conversionRate = index > 0 ? step.percentage : 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">{step.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-gray-900">
                    {new Intl.NumberFormat('fr-FR').format(step.count)}
                  </span>
                  {!isFirst && (
                    <span className="text-gray-600">{conversionRate.toFixed(1)}%</span>
                  )}
                </div>
              </div>
              <div className="relative h-12 flex items-center justify-center">
                <div
                  className="h-full rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center transition-all duration-500"
                  style={{ width: `${step.percentage}%` }}
                >
                  <span className="text-white font-semibold text-sm">
                    {step.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
