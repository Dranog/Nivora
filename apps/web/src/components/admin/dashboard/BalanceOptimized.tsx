'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, Calendar, TrendingUp } from 'lucide-react';

interface BalanceOptimizedProps {
  available: number;
  pending: number;
  minimumWithdrawal?: number;
  nextPayoutDays?: number;
}

export function BalanceOptimized({
  available,
  pending,
  minimumWithdrawal = 50,
  nextPayoutDays = 3
}: BalanceOptimizedProps) {
  const canWithdraw = available >= minimumWithdrawal;

  return (
    <Card className="overflow-hidden border-0 shadow-lg transition-all duration-300 hover:shadow-xl h-full">
      <div className="relative bg-gradient-to-br from-cyan-500 via-cyan-600 to-teal-600 h-full">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white rounded-full -translate-y-24 translate-x-24" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-16 -translate-x-16" />
        </div>

        <CardContent className="relative p-6 text-white space-y-4 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-white/90 text-sm font-medium">Balance Disponible</h3>
            <Badge variant="secondary" className="bg-white/20 text-white border-0 backdrop-blur-sm text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              +12%
            </Badge>
          </div>

          {/* Amount */}
          <div>
            <p className="text-white text-3xl font-bold tracking-tight">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(available)}
            </p>
          </div>

          {/* Info items */}
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between text-white/80 text-xs py-2 px-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>En attente</span>
              </div>
              <span className="font-medium text-white">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  maximumFractionDigits: 0
                }).format(pending)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-white/80 text-xs py-2 px-3 bg-white/10 backdrop-blur-sm rounded-lg">
              <Calendar className="h-3 w-3" />
              <span>Prochain virement dans {nextPayoutDays} jours</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            disabled={!canWithdraw}
            className={`w-full font-semibold transition-all ${
              canWithdraw
                ? 'bg-white text-cyan-600 hover:bg-gray-100 hover:shadow-md'
                : 'bg-white/30 text-white cursor-not-allowed'
            }`}
          >
            {canWithdraw ? 'Retirer les fonds' : `Minimum ${minimumWithdrawal}€ requis`}
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
