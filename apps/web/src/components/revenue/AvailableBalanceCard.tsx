'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { BalanceData } from './types';

interface AvailableBalanceCardProps {
  balance: BalanceData;
}

export function AvailableBalanceCard({ balance }: AvailableBalanceCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    const confirmed = confirm('Êtes-vous sûr de vouloir retirer ces fonds ?');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Retrait initié avec succès', {
        description: `Montant: ${new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(balance.available)}`,
      });
    } catch (error) {
      toast.error('Erreur lors du retrait', {
        description: 'Veuillez réessayer ultérieurement',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-xl shadow-lg p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 opacity-20">
        <CreditCard className="w-32 h-32" aria-hidden={true} />
      </div>

      <div className="relative z-10 space-y-4">
        <p className="text-sm text-white/90 font-medium">Available Balance</p>
        <p className="text-5xl font-bold text-white">
          {new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
          }).format(balance.available)}
        </p>
        <p className="text-sm text-white/80">Disponible pour retrait</p>

        <Button
          onClick={handleWithdraw}
          disabled={isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Traitement en cours...' : 'Retirer les fonds'}
        </Button>
      </div>
    </div>
  );
}
