'use client';

import { useState } from 'react';
import { Heart, MessageSquare, Reply, Users, Clock, RefreshCw } from 'lucide-react';
import {
  KPICard,
  BalanceCard,
  UpcomingPaymentsCard,
  Evolution7dCard,
  RevenueChartCard,
  TopCreatorsCard,
  EngagementMetricsCard,
  LiveStatsCard,
  RevenueSourcesCard,
  GeographyCard,
  ConversionFunnelCard,
  type KPIData,
  type BalanceData,
  type UpcomingPayment,
  type Evolution7dData,
  type RevenueDataPoint,
  type Creator,
  type EngagementMetric,
  type LiveStatsMetric,
  type RevenueSource,
  type Country,
  type FunnelStep,
} from '@/components/dashboard';

// ============================================
// 📊 DONNÉES DE DÉMONSTRATION (DEMO DATA)
// ============================================

const DEMO_KPIS: KPIData[] = [
  {
    icon: 'DollarSign',
    iconColor: 'blue',
    label: 'Revenus Totaux',
    value: '€24,580',
    trend: '+15.7%',
  },
  {
    icon: 'Users',
    iconColor: 'cyan',
    label: 'Nouveaux Utilisateurs',
    value: '142',
    trend: '+22.1%',
  },
  {
    icon: 'Video',
    iconColor: 'green',
    label: 'Posts Totaux',
    value: '1,247',
    trend: '+12.3%',
  },
  {
    icon: 'AlertCircle',
    iconColor: 'purple',
    label: 'Modération en Attente',
    value: '8',
    trend: 'warning',
  },
];

const DEMO_BALANCE: BalanceData = {
  available: 12450.5,
  pending: 3200.0,
  nextPayoutDays: 3,
};

const DEMO_UPCOMING_PAYMENTS: UpcomingPayment[] = [
  { days: 3, amount: 3200, status: 'pending' },
  { days: 10, amount: 4500, status: 'released' },
  { days: 17, amount: 2100, status: 'released' },
];

const DEMO_EVOLUTION_7D: Evolution7dData = {
  current: 24580,
  growth: 9.4,
  sparklineData: [18200, 19400, 20100, 21800, 22500, 23400, 24580],
};

const DEMO_REVENUE_CHART: RevenueDataPoint[] = [
  { date: 'Lun', revenus: 3200, ppv: 1200, tips: 800, marketplace: 1200 },
  { date: 'Mar', revenus: 3500, ppv: 1300, tips: 900, marketplace: 1300 },
  { date: 'Mer', revenus: 3100, ppv: 1100, tips: 700, marketplace: 1300 },
  { date: 'Jeu', revenus: 4200, ppv: 1600, tips: 1100, marketplace: 1500 },
  { date: 'Ven', revenus: 3800, ppv: 1400, tips: 1000, marketplace: 1400 },
  { date: 'Sam', revenus: 4500, ppv: 1700, tips: 1200, marketplace: 1600 },
  { date: 'Dim', revenus: 4100, ppv: 1500, tips: 1100, marketplace: 1500 },
];

const DEMO_TOP_CREATORS: Creator[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    username: '@sophie.m',
    avatar: 'https://i.pravatar.cc/150?img=1',
    amount: 8450,
    trend: 12.5,
    sparklineData: [6200, 6500, 7100, 7800, 8000, 8200, 8450],
    isHot: true,
  },
  {
    id: '2',
    name: 'Lucas Dubois',
    username: '@lucas.d',
    avatar: 'https://i.pravatar.cc/150?img=2',
    amount: 7200,
    trend: 8.3,
    sparklineData: [6100, 6300, 6500, 6800, 6900, 7000, 7200],
    isHot: false,
  },
  {
    id: '3',
    name: 'Emma Petit',
    username: '@emma.p',
    avatar: 'https://i.pravatar.cc/150?img=3',
    amount: 6800,
    trend: -2.1,
    sparklineData: [7200, 7100, 6900, 6800, 6750, 6800, 6800],
    isHot: false,
  },
  {
    id: '4',
    name: 'Thomas Roux',
    username: '@thomas.r',
    avatar: 'https://i.pravatar.cc/150?img=4',
    amount: 5900,
    trend: 15.7,
    sparklineData: [4500, 4800, 5100, 5400, 5600, 5700, 5900],
    isHot: true,
  },
  {
    id: '5',
    name: 'Marie Laurent',
    username: '@marie.l',
    avatar: 'https://i.pravatar.cc/150?img=5',
    amount: 5400,
    trend: 5.2,
    sparklineData: [5000, 5100, 5150, 5200, 5300, 5350, 5400],
    isHot: false,
  },
];

const DEMO_ENGAGEMENT_METRICS: EngagementMetric[] = [
  {
    icon: Heart,
    iconColor: 'green',
    label: 'Likes Totaux',
    value: '24,589',
    progressBar: 75,
    badge: '+12.5%',
    badgeVariant: 'green',
  },
  {
    icon: MessageSquare,
    iconColor: 'blue',
    label: 'Commentaires',
    value: '8,432',
    progressBar: 60,
    badge: '+8.3%',
    badgeVariant: 'green',
  },
  {
    icon: Reply,
    iconColor: 'purple',
    label: 'Partages',
    value: '3,245',
    progressBar: 45,
    badge: '+15.7%',
    badgeVariant: 'green',
  },
];

const DEMO_LIVE_STATS: LiveStatsMetric[] = [
  {
    label: 'Utilisateurs Actifs',
    value: '847',
    icon: Users,
    iconColor: 'cyan',
    badge: 'Maintenant',
    badgeVariant: 'green',
  },
  {
    label: 'Durée Moy. Session',
    value: '12min',
    icon: Clock,
    iconColor: 'blue',
    badge: '24h',
    badgeVariant: 'green',
  },
  {
    label: 'Taux Rebond',
    value: '32.5%',
    icon: RefreshCw,
    iconColor: 'cyan',
    badge: 'Bon',
    badgeVariant: 'green',
  },
];

const DEMO_REVENUE_SOURCES: RevenueSource[] = [
  {
    name: 'Abonnements',
    value: 12400,
    percentage: 50.5,
    color: '#00B8A9',
  },
  {
    name: 'PPV',
    value: 7200,
    percentage: 29.3,
    color: '#F8B400',
  },
  {
    name: 'Tips',
    value: 3100,
    percentage: 12.6,
    color: '#F6416C',
  },
  {
    name: 'Marketplace',
    value: 1880,
    percentage: 7.6,
    color: '#6C5CE7',
  },
];

const DEMO_GEOGRAPHY: Country[] = [
  {
    flag: '🇫🇷',
    name: 'France',
    amount: 12450,
    percentage: 50.6,
  },
  {
    flag: '🇺🇸',
    name: 'États-Unis',
    amount: 6200,
    percentage: 25.2,
  },
  {
    flag: '🇬🇧',
    name: 'Royaume-Uni',
    amount: 3100,
    percentage: 12.6,
  },
  {
    flag: '🇨🇦',
    name: 'Canada',
    amount: 1800,
    percentage: 7.3,
  },
  {
    flag: '🇩🇪',
    name: 'Allemagne',
    amount: 1030,
    percentage: 4.3,
  },
];

const DEMO_FUNNEL: FunnelStep[] = [
  {
    label: 'Visiteurs',
    value: 45200,
    percentage: 100,
  },
  {
    label: 'Inscription',
    value: 12400,
    percentage: 27.4,
  },
  {
    label: 'Profil Complété',
    value: 8900,
    percentage: 19.7,
  },
  {
    label: 'Premier Abonnement',
    value: 3200,
    percentage: 7.1,
  },
  {
    label: 'Utilisateur Actif',
    value: 2100,
    percentage: 4.6,
  },
];

// ============================================
// 🎨 COMPOSANT DASHBOARD (MODE DEMO)
// ============================================

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <div className="p-6 space-y-6">
        {/* Header avec badge DEMO */}
        <div className="mb-2 flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Vue d'ensemble de votre plateforme
            </p>
          </div>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            MODE DÉMO
          </span>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {DEMO_KPIS.map((kpi, index) => (
            <KPICard key={index} data={kpi} />
          ))}
        </div>

        {/* Balance + Upcoming Payments + Evolution 7d */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-4">
            <BalanceCard data={DEMO_BALANCE} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <UpcomingPaymentsCard payments={DEMO_UPCOMING_PAYMENTS} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <Evolution7dCard data={DEMO_EVOLUTION_7D} />
          </div>
        </div>

        {/* Revenue Chart + Top Creators */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7">
            <RevenueChartCard data={DEMO_REVENUE_CHART} />
          </div>
          <div className="col-span-12 lg:col-span-5">
            <TopCreatorsCard creators={DEMO_TOP_CREATORS} />
          </div>
        </div>

        {/* Engagement + Live Stats + Revenue Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EngagementMetricsCard metrics={DEMO_ENGAGEMENT_METRICS} />
          <LiveStatsCard stats={DEMO_LIVE_STATS} />
          <RevenueSourcesCard sources={DEMO_REVENUE_SOURCES} />
        </div>

        {/* Geography + Conversion Funnel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GeographyCard countries={DEMO_GEOGRAPHY} />
          <ConversionFunnelCard steps={DEMO_FUNNEL} />
        </div>
      </div>
    </div>
  );
}
