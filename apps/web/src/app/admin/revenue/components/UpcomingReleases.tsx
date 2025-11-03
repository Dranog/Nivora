'use client';

import { Card } from '@/components/ui/card';
import type { UpcomingRelease } from '../types';

interface UpcomingReleasesProps {
  releases: UpcomingRelease[];
}

export function UpcomingReleases({ releases }: UpcomingReleasesProps) {
  return (
    <Card className="col-span-12 lg:col-span-4 shadow-card border-gray-100/50">
      <div className="p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">Upcoming Releases</h3>

        <div className="grid grid-cols-2 gap-4">
          {releases.map((release, index) => (
            <div key={index} className="space-y-2">
              <p className="text-xs text-gray-500">In {release.days} days</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 2,
                }).format(release.amount)}
              </p>
              <p
                className={`text-xs font-medium ${
                  release.status === 'released' ? 'text-gray-500' : 'text-cyan-500'
                }`}
              >
                {release.status === 'released' ? 'released' : 'pending'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
