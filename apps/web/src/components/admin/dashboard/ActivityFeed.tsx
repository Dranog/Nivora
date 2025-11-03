'use client';

import { CheckCircle2, DollarSign, AlertCircle, UserPlus, ArrowDownCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ActivityType = 'creator_verified' | 'transaction' | 'report_resolved' | 'subscription' | 'payout_approved';

interface Activity {
  type: ActivityType;
  user: string;
  time: string;
  amount?: number;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const activityConfig: Record<ActivityType, { icon: typeof CheckCircle2; color: string; bgColor: string; label: string }> = {
  creator_verified: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Créateur vérifié'
  },
  transaction: {
    icon: DollarSign,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
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

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="transition-all duration-300 hover:shadow-lg flex flex-col h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Activité Récente</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 overflow-auto">
        <div className="space-y-0 divide-y">
          {activities.map((activity, index) => {
            const config = activityConfig[activity.type];
            const Icon = config.icon;

            return (
              <div key={index} className="flex items-center gap-3 py-3">
                <div className={cn("p-2 rounded-lg", config.bgColor)}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {config.label}
                    {activity.amount && (
                      <span className="ml-1 font-semibold">
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(activity.amount)}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
