'use client';

import type { Activity } from './types';

interface ActivityTimelineCardProps {
  activities: Activity[];
}

export function ActivityTimelineCard({ activities }: ActivityTimelineCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Activité Récente</h3>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activity.icon;
          const isLast = index === activities.length - 1;

          return (
            <div key={activity.id} className="flex gap-3 relative">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Icon className={`w-5 h-5 ${activity.iconColor}`} aria-hidden={true} />
                </div>
                {!isLast && (
                  <div className="absolute top-10 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gray-200" />
                )}
              </div>

              <div className="flex-1 pt-1">
                <p className="text-sm text-gray-900 font-medium">{activity.text}</p>
                <p className="text-xs text-gray-500 mt-0.5">{activity.timestamp}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
