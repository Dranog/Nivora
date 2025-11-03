'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpcomingPayout {
  days: number;
  amount: number;
  status: 'released' | 'pending';
}

interface UpcomingPayoutsCompactProps {
  payouts: UpcomingPayout[];
}

export function UpcomingPayoutsCompact({ payouts }: UpcomingPayoutsCompactProps) {
  const compactPayouts = payouts.slice(0, 2);

  return (
    <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-lg transition-all duration-300 border-gray-100/50" role="article" aria-label="Prochains paiements">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Prochains Paiements</h3>
      <div className="space-y-3 flex-1">
        {compactPayouts.map((payout, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-gray-100/80 transition-colors">
            <span className="text-xs font-medium text-gray-600 flex-shrink-0">Dans {payout.days}j</span>
            <Badge
              variant={payout.status === 'released' ? 'secondary' : 'outline'}
              className={payout.status === 'released'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                : 'bg-amber-50 text-amber-700 border-amber-200 font-semibold'}
            >
              {payout.status === 'released' ? 'Released' : 'En attente'}
            </Badge>
            <span className="font-bold text-sm ml-auto text-gray-900">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                maximumFractionDigits: 0
              }).format(payout.amount)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
