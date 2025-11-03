'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { UpcomingRelease } from './types';

interface UpcomingReleasesCardProps {
  releases: UpcomingRelease[];
}

export function UpcomingReleasesCard({ releases }: UpcomingReleasesCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    const confirmed = confirm('Retirer les fonds disponibles ?');
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Retrait initié', {
        description: 'Vos fonds seront transférés sous 2-3 jours ouvrables',
      });
    } catch (error) {
      toast.error('Erreur lors du retrait', {
        description: 'Veuillez réessayer',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="col-span-12 bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900">Upcoming Releases</h3>
        <Button
          onClick={handleWithdraw}
          disabled={isLoading}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Traitement...' : 'Retirer les fonds'}
        </Button>
      </div>

      <div className="flex justify-between gap-6">
        {releases.map((release, index) => (
          <div key={index} className="flex-1">
            <p className="text-sm text-gray-500 mb-2">In {release.days} days</p>
            <p className={`text-4xl font-bold mb-1 ${release.status === 'pending' ? 'text-cyan-500' : 'text-gray-900'}`}>
              {new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 2,
              }).format(release.amount)}
            </p>
            <p className="text-sm text-gray-400">{release.status === 'released' ? 'released' : 'reased'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
