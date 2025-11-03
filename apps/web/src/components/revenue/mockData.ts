import type { Transaction, RevenueSource, EvolutionDataPoint, BalanceData, UpcomingRelease } from './types';

export const mockBalance: BalanceData = {
  available: 12450,
  pending: 5300,
};

export const mockNextPayout = {
  date: 'Oct 25, 2025',
};

export const mockEvolutionData: EvolutionDataPoint[] = [
  {
    date: 'Oct 14',
    revenus_bruts: 2100,
    ppv_achats: 520,
    tips: 230,
    marketplace: 105,
  },
  {
    date: 'Oct 16',
    revenus_bruts: 2800,
    ppv_achats: 680,
    tips: 310,
    marketplace: 140,
  },
  {
    date: 'Oct 18',
    revenus_bruts: 3500,
    ppv_achats: 850,
    tips: 380,
    marketplace: 175,
  },
  {
    date: 'Oct 19',
    revenus_bruts: 4200,
    ppv_achats: 1020,
    tips: 450,
    marketplace: 210,
  },
];

export const mockUpcomingReleases: UpcomingRelease[] = [
  {
    days: 3,
    amount: 3500,
    status: 'released',
  },
  {
    days: 15,
    amount: 1800,
    status: 'pending',
  },
];

export const mockRevenueSources: RevenueSource[] = [
  {
    name: 'Abonnements',
    percentage: 60,
    color: '#06b6d4',
    trend: 60,
  },
  {
    name: 'PPV/Achats',
    percentage: 25,
    color: '#3b82f6',
    trend: 10,
  },
  {
    name: 'Tips/Pourboires',
    percentage: 10,
    color: '#8b5cf6',
    trend: -10,
  },
  {
    name: 'Marketplace',
    percentage: 5,
    color: '#f97316',
    trend: 5,
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'subscription',
    from: {
      name: 'Sophie M.',
      initials: 'SM',
      avatarColor: '#06b6d4',
    },
    amount: 15.0,
    status: 'complete',
    date: '2025-10-20',
  },
  {
    id: 'TXN-002',
    type: 'ppv',
    from: {
      name: 'Mark D.',
      initials: 'MD',
      avatarColor: '#3b82f6',
    },
    amount: 5.0,
    status: 'cancelled',
    date: '2025-10-20',
  },
  {
    id: 'TXN-003',
    type: 'tip',
    from: {
      name: 'Alice K.',
      initials: 'AK',
      avatarColor: '#f97316',
    },
    amount: 5.87,
    status: 'cancelled',
    date: '2025-10-19',
  },
  {
    id: 'TXN-004',
    type: 'marketplace',
    from: {
      name: 'John P.',
      initials: 'JP',
      avatarColor: '#f97316',
    },
    amount: 5.0,
    status: 'pending',
    date: '2025-10-19',
  },
];
