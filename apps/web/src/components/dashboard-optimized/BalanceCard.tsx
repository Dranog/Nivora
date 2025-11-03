'use client';

import { useState } from 'react';
import { Wallet, ArrowDownToLine } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { BalanceData } from './types';

interface BalanceCardProps {
  balance: BalanceData;
}

export function BalanceCard({ balance }: BalanceCardProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
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
    <div className="bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 rounded-xl shadow-lg p-6 text-white">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="w-5 h-5" aria-hidden={true} />
        <h3 className="text-sm font-semibold opacity-90">Balance Disponible</h3>
      </div>

      <p className="text-5xl font-bold mb-2">
        {new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(balance.available)}
      </p>

      <p className="text-sm opacity-90 mb-6">
        {new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(balance.pending)}{' '}
        en attente
      </p>

      <Button
        onClick={handleWithdraw}
        disabled={isWithdrawing}
        className="w-full bg-white text-cyan-600 hover:bg-gray-50 font-semibold h-12 rounded-lg"
      >
        <ArrowDownToLine className="w-4 h-4 mr-2" aria-hidden={true} />
        {isWithdrawing ? 'Traitement...' : 'Retirer les fonds'}
      </Button>

      <p className="text-xs opacity-75 mt-3 text-center">
        Prochain paiement dans {balance.nextPayoutDays} jours
      </p>
    </div>
  );
}
