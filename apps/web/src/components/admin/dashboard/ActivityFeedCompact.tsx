'use client';

import { CheckCircle2, DollarSign, AlertCircle, UserPlus, ArrowDownCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ActivityType = 'creator_verified' | 'transaction' | 'report_resolved' | 'subscription' | 'payout_approved';

interface Activity {
  type: ActivityType;
  user: string;
  time: string;
  amount?: number;
}

interface ActivityFeedCompactProps {
  activities: Activity[];
}

const activityConfig: Record<ActivityType, { icon: typeof CheckCircle2; color: string; bgColor: string; label: string }> = {
  creator_verified: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    label: 'Créateur vérifié'
  },
  transaction: {
    icon: DollarSign,
    color: 'text-brand-600',
    bgColor: 'bg-brand-50',
    label: 'Transaction'
  },
  report_resolved: {
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Signalement résolu'
  },
  subscription: {
    icon: UserPlus,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Nouvel abonnement'
  },
  payout_approved: {
    icon: ArrowDownCircle,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Retrait approuvé'
  }
};

export function ActivityFeedCompact({ activities }: ActivityFeedCompactProps) {
  const compactActivities = activities.slice(0, 5);

  return (
    <Card className="p-6 h-full flex flex-col shadow-card hover:shadow-lg transition-all duration-300 border-gray-100/50" role="article" aria-label="Activité récente">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Activité Récente</h3>
      <div className="space-y-2.5 flex-1 overflow-auto">
        {compactActivities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <div key={index} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-gray-50/80 transition-colors">
              <div className={cn("p-1.5 rounded-lg flex-shrink-0", config.bgColor)}>
                <Icon className={cn("h-3.5 w-3.5", config.color)} aria-hidden={true} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate">
                  {config.label}
                  {activity.amount && (
                    <span className="ml-1 text-brand-600">
                      {new Intl.NumberFormat('fr-FR', {
                        style: 'currency',
                        currency: 'EUR',
                        maximumFractionDigits: 0
                      }).format(activity.amount)}
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
