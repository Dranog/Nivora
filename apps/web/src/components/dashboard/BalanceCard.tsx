'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { BalanceData } from './types';

interface BalanceCardProps {
  data: BalanceData;
}

export function BalanceCard({ data }: BalanceCardProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    const confirmed = confirm('Confirmer le retrait de fonds ?');
    if (!confirmed) return;

    setIsWithdrawing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Demande de retrait envoyée', {
        description: 'Les fonds seront transférés sous 2-3 jours',
      });
    } catch (error) {
      toast.error('Erreur lors du retrait', {
        description: 'Veuillez réessayer',
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl shadow-sm p-6 flex flex-col">
      <p className="text-6xl font-bold text-white mb-2">
        {new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(data.available)}
      </p>
      <p className="text-white/80 text-sm mb-4">Disponible pour retrait</p>

      <div className="space-y-1 mb-6 text-sm text-white/90">
        <p>
          En attente{' '}
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(data.pending)}
        </p>
        <p>Prochain virement {data.nextPayoutDays} jours</p>
      </div>

      <Button
        onClick={handleWithdraw}
        disabled={isWithdrawing}
        className="w-full bg-white text-cyan-600 hover:bg-cyan-50 font-semibold mt-auto"
      >
        {isWithdrawing ? 'Traitement...' : 'Retirer'}
      </Button>
    </div>
  );
}
