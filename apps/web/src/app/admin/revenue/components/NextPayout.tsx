'use client';

import { Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface NextPayoutProps {
  date: string;
}

export function NextPayout({ date }: NextPayoutProps) {
  return (
    <Card className="col-span-12 lg:col-span-3 shadow-card border-gray-100/50">
      <div className="p-6 flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 flex items-center justify-center">
          <Calendar className="w-6 h-6 text-cyan-600" aria-hidden={true} />
        </div>

        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Next Payout</h3>
          <p className="text-3xl font-bold text-gray-900">{date}</p>
        </div>
      </div>
    </Card>
  );
}
