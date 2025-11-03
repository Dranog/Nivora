'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpcomingPayout {
  days: number;
  amount: number;
  status: 'released' | 'pending';
}

interface UpcomingPayoutsProps {
  payouts: UpcomingPayout[];
}

export function UpcomingPayouts({ payouts }: UpcomingPayoutsProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Prochains Paiements</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto space-y-3">
        {payouts.map((payout, index) => {
          const formattedAmount = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
          }).format(payout.amount);

          return (
            <div key={index} className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Dans {payout.days} jours</p>
                <p className="font-semibold">{formattedAmount}</p>
              </div>
              <Badge
                variant="outline"
                className={
                  payout.status === 'released'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }
              >
                {payout.status === 'released' ? 'Released' : 'En attente'}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
