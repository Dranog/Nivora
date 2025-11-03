'use client';

import { KPICard } from '@/components/dashboard-optimized/KPICard';
import { BalanceCard } from '@/components/dashboard-optimized/BalanceCard';
import { UpcomingPaymentsCard } from '@/components/dashboard-optimized/UpcomingPaymentsCard';
import { MiniEvolutionCard } from '@/components/dashboard-optimized/MiniEvolutionCard';
import { RevenueChart } from '@/components/dashboard-optimized/RevenueChart';
import { TopCreatorsCard } from '@/components/dashboard-optimized/TopCreatorsCard';
import { ActivityTimeline } from '@/components/dashboard-optimized/ActivityTimeline';
import { RevenueSourcesDonut } from '@/components/dashboard-optimized/RevenueSourcesDonut';
import { GeographyList } from '@/components/dashboard-optimized/GeographyList';
import { ConversionFunnel } from '@/components/dashboard-optimized/ConversionFunnel';
import {
  mockKPIs,
  mockBalance,
  mockUpcomingPayments,
  mockEvolution7Days,
  mockRevenueData,
  mockTopCreators,
  mockActivities,
  mockRevenueSources,
  mockGeography,
  mockFunnelData,
} from '@/components/dashboard-optimized/mockData';

export default function DashboardOptimizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="p-6 space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard Optimisé
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Vue d'ensemble de votre plateforme de créateurs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockKPIs.map((kpi, index) => (
            <KPICard key={index} kpi={kpi} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <BalanceCard balance={mockBalance} />
          </div>
          <div className="lg:col-span-4">
            <UpcomingPaymentsCard payments={mockUpcomingPayments} />
          </div>
          <div className="lg:col-span-4">
            <MiniEvolutionCard
              current={mockEvolution7Days.current}
              growth={mockEvolution7Days.growth}
              data={mockEvolution7Days.data}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <RevenueChart data={mockRevenueData} />
          </div>
          <div className="lg:col-span-5">
            <TopCreatorsCard creators={mockTopCreators} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <ActivityTimeline activities={mockActivities} />
          </div>
          <div className="lg:col-span-7">
            <RevenueSourcesDonut sources={mockRevenueSources} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GeographyList countries={mockGeography} />
          <ConversionFunnel steps={mockFunnelData} />
        </div>
      </div>
    </div>
  );
}
