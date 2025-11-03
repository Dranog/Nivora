'use client';

import { Activity as ActivityIcon, CheckCircle, CreditCard, Flag, UserPlus, Wallet } from 'lucide-react';
import type { Activity, ActivityType } from './types';

interface ActivityTimelineProps {
  activities: Activity[];
}

const ACTIVITY_CONFIG: Record<
  ActivityType,
  {
    icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  creator_verified: {
    icon: CheckCircle,
    label: 'Créateur vérifié',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  transaction: {
    icon: CreditCard,
    label: 'Transaction',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  report_resolved: {
    icon: Flag,
    label: 'Signalement résolu',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  subscription: {
    icon: UserPlus,
    label: 'Nouvel abonnement',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  payout_approved: {
    icon: Wallet,
    label: 'Paiement approuvé',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <ActivityIcon className="w-5 h-5 text-gray-700" aria-hidden={true} />
        <h3 className="text-base font-semibold text-gray-900">Activité Récente</h3>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const config = ACTIVITY_CONFIG[activity.type];
          const Icon = config.icon;

          return (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${config.color}`} aria-hidden={true} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">{activity.user}</span>{' '}
                  <span className="text-gray-600">{config.label.toLowerCase()}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">{activity.time}</p>
                  {activity.amount !== undefined && (
                    <>
                      <span className="text-xs text-gray-400">•</span>
                      <p className="text-xs font-semibold text-gray-900">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                        }).format(activity.amount)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
