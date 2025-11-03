'use client';

import { CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';

interface AvailableBalanceProps {
  available: number;
  pending: number;
}

export function AvailableBalance({ available, pending }: AvailableBalanceProps) {
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async () => {
    setIsWithdrawing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    toast.success('Demande de retrait initiée', {
      description: `Montant: ${new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
      }).format(available)}`,
    });
    setIsWithdrawing(false);
  };

  return (
    <Card className="col-span-12 lg:col-span-4 relative overflow-hidden bg-gradient-to-br from-cyan-400 to-cyan-500 border-0 shadow-lg">
      <div className="absolute top-0 right-0 w-48 h-48 opacity-10">
        <CreditCard className="w-full h-full" aria-hidden={true} />
      </div>

      <div className="relative p-6 space-y-4">
        <div>
          <h3 className="text-white/90 text-sm font-medium">Available Balance</h3>
          <p className="text-5xl font-bold text-white mt-2">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 2,
            }).format(available)}
          </p>
          <p className="text-white/80 text-sm mt-2">Disponible pour retrait</p>
        </div>

        <div className="flex items-center justify-between text-white/70 text-xs">
          <span>En attente</span>
          <span className="font-semibold text-white">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            }).format(pending)}
          </span>
        </div>

        <Button
          onClick={handleWithdraw}
          disabled={isWithdrawing}
          className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWithdrawing ? 'Traitement...' : 'Retirer les fonds'}
        </Button>
      </div>
    </Card>
  );
}
