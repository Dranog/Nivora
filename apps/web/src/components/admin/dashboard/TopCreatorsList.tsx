'use client';

import { ArrowRight } from 'lucide-react';

interface Creator {
  name: string;
  avatar: string;
  revenue: number;
}

interface TopCreatorsListProps {
  creators: Creator[];
}

export function TopCreatorsList({ creators }: TopCreatorsListProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-all p-6 h-[320px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Créateurs</h3>
      <p className="text-xs text-gray-500 mb-3">Ce mois</p>
      <div className="flex-1 overflow-y-auto space-y-3">
        {creators.map((creator, index) => {
          const formattedRevenue = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
          }).format(creator.revenue);

          return (
            <div key={creator.name} className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-400 w-6">{index + 1}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                {creator.avatar}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{creator.name}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{formattedRevenue}</p>
            </div>
          );
        })}
      </div>
      <button className="mt-4 w-full py-2 text-sm font-medium text-cyan-600 hover:bg-cyan-50 rounded-lg transition-all flex items-center justify-center gap-2">
        Voir tous les créateurs
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
