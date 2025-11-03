'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface BalanceCompactProps {
  available: number;
  pending: number;
  nextPayoutDays?: number;
}

export function BalanceCompact({
  available,
  pending,
  nextPayoutDays = 3
}: BalanceCompactProps) {
  return (
    <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-lg transition-all duration-300 border-gray-100/50" role="article" aria-label="Balance disponible">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Balance Disponible</h3>
      <p className="text-3xl font-bold bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent mb-4">
        {new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0
        }).format(available)}
      </p>
      <div className="space-y-2.5 text-xs text-gray-600 flex-1 mb-4">
        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50/80">
          <span>En attente</span>
          <span className="font-semibold text-gray-900">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              maximumFractionDigits: 0
            }).format(pending)}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-lg bg-gray-50/80">
          <span>Prochain virement</span>
          <span className="font-semibold text-gray-900">{nextPayoutDays} jours</span>
        </div>
      </div>
      <Button
        size="sm"
        className="w-full bg-gradient-to-r from-brand-start to-brand-end hover:brightness-110 text-white font-semibold rounded-2xl shadow-sm transition-all duration-300 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        aria-label="Retirer les fonds"
      >
        Retirer
      </Button>
    </Card>
  );
}
