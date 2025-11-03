'use client';

import { AvailableBalanceCard } from '@/components/revenue/AvailableBalanceCard';
import { NextPayoutCard } from '@/components/revenue/NextPayoutCard';
import { EvolutionRevenusCard } from '@/components/revenue/EvolutionRevenusCard';
import { UpcomingReleasesCard } from '@/components/revenue/UpcomingReleasesCard';
import { SourcesRevenusCard } from '@/components/revenue/SourcesRevenusCard';
import { TransactionsTableCard } from '@/components/revenue/TransactionsTableCard';
import {
  mockBalance,
  mockNextPayout,
  mockEvolutionData,
  mockUpcomingReleases,
  mockRevenueSources,
  mockTransactions,
} from '@/components/revenue/mockData';

export default function RevenueDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Revenue Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos revenus et transactions en temps réel
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <AvailableBalanceCard balance={mockBalance} />

          <NextPayoutCard date={mockNextPayout.date} />

          <EvolutionRevenusCard data={mockEvolutionData} />

          <UpcomingReleasesCard releases={mockUpcomingReleases} />

          <SourcesRevenusCard sources={mockRevenueSources} />

          <TransactionsTableCard transactions={mockTransactions} />
        </div>
      </div>
    </div>
  );
}
