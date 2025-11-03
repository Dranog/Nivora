'use client';

import type { Creator } from './types';

interface TopCreatorsExtendedCardProps {
  creators: Creator[];
}

export function TopCreatorsExtendedCard({ creators }: TopCreatorsExtendedCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Top Créateurs</h3>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {creators.map((creator, index) => (
          <div
            key={creator.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-gray-500 w-6">
              {index + 1}
            </span>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
              {creator.avatar}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {creator.name}
              </p>
            </div>

            <p className="text-sm font-semibold text-gray-900">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(creator.amount)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
