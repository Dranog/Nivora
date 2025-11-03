'use client';

import { Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { UpcomingPayment } from './types';

interface UpcomingPaymentsCardProps {
  payments: UpcomingPayment[];
}

export function UpcomingPaymentsCard({ payments }: UpcomingPaymentsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-gray-700" aria-hidden={true} />
        <h3 className="text-base font-semibold text-gray-900">Prochains Paiements</h3>
      </div>

      <div className="space-y-3">
        {payments.map((payment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-gray-600" aria-hidden={true} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Dans {payment.days} jour{payment.days > 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-600">
                  {new Intl.NumberFormat('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(payment.amount)}
                </p>
              </div>
            </div>

            <Badge
              className={
                payment.status === 'released'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-orange-100 text-orange-700 border-orange-200'
              }
            >
              {payment.status === 'released' ? 'Libéré' : 'En attente'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
