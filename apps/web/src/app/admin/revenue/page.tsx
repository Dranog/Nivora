'use client';

import { AvailableBalance } from './components/AvailableBalance';
import { NextPayout } from './components/NextPayout';
import { EvolutionRevenus } from './components/EvolutionRevenus';
import { UpcomingReleases } from './components/UpcomingReleases';
import { SourcesRevenus } from './components/SourcesRevenus';
import { TransactionsTable } from './components/TransactionsTable';
import { Button } from '@/components/ui/button';
import { AlertCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  mockBalance,
  mockRevenueEvolution,
  mockUpcomingReleases,
  mockRevenueSources,
  mockTransactions,
} from './mockData';

export default function RevenueDashboardPage() {
  const [isUploadingKyc, setIsUploadingKyc] = useState(false);

  const handleKycUpload = async () => {
    setIsUploadingKyc(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast.success('Documents KYC téléchargés', {
      description: 'Votre dossier est en cours de vérification',
    });
    setIsUploadingKyc(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Revenue Dashboard
            </h1>
            <p className="mt-2 text-sm text-gray-600 font-medium">
              Vue complète de vos revenus et transactions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <AvailableBalance available={mockBalance.available} pending={mockBalance.pending} />

          <NextPayout date={mockBalance.nextPayoutDate} />

          <EvolutionRevenus data={mockRevenueEvolution} />

          <UpcomingReleases releases={mockUpcomingReleases} />

          <SourcesRevenus sources={mockRevenueSources} />

          <TransactionsTable transactions={mockTransactions} />
        </div>

        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 rounded-lg shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-600" aria-hidden={true} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-yellow-900 mb-1">
                Verification KYC
              </h3>
              <p className="text-sm text-yellow-800">
                Vérification KYC requise pour les paiements. Complétez votre profil en
                téléchargeant vos documents pour débloquer les paiements.
              </p>
            </div>
            <Button
              onClick={handleKycUpload}
              disabled={isUploadingKyc}
              className="flex-shrink-0 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4 mr-2" aria-hidden={true} />
              {isUploadingKyc ? 'Upload...' : 'Upload documents'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
