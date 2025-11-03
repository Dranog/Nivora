'use client';

import { Badge } from '@/components/ui/badge';
import type { UpcomingPayment } from './types';

interface UpcomingPaymentsCardProps {
  payments: UpcomingPayment[];
}

export function UpcomingPaymentsCard({ payments }: UpcomingPaymentsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Prochains Paiements</h3>

      <div className="space-y-3">
        {payments.map((payment, index) => (
          <div
            key={index}
            className="grid grid-cols-[1fr,auto,auto] items-center gap-4"
          >
            <span className="text-sm text-gray-700">Dans {payment.days}j</span>
            <span className="text-sm font-semibold text-gray-900">
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(payment.amount)}
            </span>
            <Badge
              className={
                payment.status === 'released'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-orange-100 text-orange-700 border-orange-200'
              }
            >
              {payment.status === 'released' ? 'Released' : 'En attente'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
