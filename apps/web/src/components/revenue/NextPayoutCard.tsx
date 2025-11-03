'use client';

import { Calendar } from 'lucide-react';

interface NextPayoutCardProps {
  date: string;
}

export function NextPayoutCard({ date }: NextPayoutCardProps) {
  return (
    <div className="col-span-12 lg:col-span-3 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center h-full">
      <div className="flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
        <Calendar className="w-8 h-8 text-cyan-600" aria-hidden={true} />
      </div>
      <p className="text-sm text-gray-600 mb-2">Next Payout</p>
      <p className="text-3xl font-bold text-gray-900">{date}</p>
    </div>
  );
}
