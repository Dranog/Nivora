import type { Transaction, RevenueSource, RevenueEvolutionDataPoint, UpcomingRelease } from './types';

const CREATORS = [
  { name: 'Sophie Martin', avatar: 'SM' },
  { name: 'Lucas Bernard', avatar: 'LB' },
  { name: 'Emma Dubois', avatar: 'ED' },
  { name: 'Thomas Petit', avatar: 'TP' },
  { name: 'Léa Moreau', avatar: 'LM' },
  { name: 'Antoine Roux', avatar: 'AR' },
  { name: 'Camille Blanc', avatar: 'CB' },
  { name: 'Hugo Garnier', avatar: 'HG' },
  { name: 'Chloé Faure', avatar: 'CF' },
  { name: 'Maxime Rousseau', avatar: 'MR' },
];

const TRANSACTION_TYPES = ['subscription', 'ppv', 'tip', 'marketplace'] as const;
const TRANSACTION_STATUSES = ['complete', 'pending', 'processing'] as const;

function generateTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(i / 8);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const creator = CREATORS[Math.floor(Math.random() * CREATORS.length)];
    const type = TRANSACTION_TYPES[Math.floor(Math.random() * TRANSACTION_TYPES.length)];
    const status = TRANSACTION_STATUSES[Math.floor(Math.random() * TRANSACTION_STATUSES.length)];

    const baseAmounts = {
      subscription: () => 9.99 + Math.random() * 40,
      ppv: () => 5 + Math.random() * 45,
      tip: () => 2 + Math.random() * 98,
      marketplace: () => 10 + Math.random() * 190,
    };

    transactions.push({
      id: `TXN-${String(i + 1).padStart(6, '0')}`,
      type,
      date: date.toISOString(),
      from: creator,
      amount: Math.round(baseAmounts[type]() * 100) / 100,
      status,
    });
  }

  return transactions;
}

export const mockTransactions: Transaction[] = generateTransactions(234);

export const mockRevenueSources: RevenueSource[] = [
  {
    name: 'Abonnements',
    value: 60,
    amount: 7470,
    color: '#00B8A9',
    trend: 12.5,
  },
  {
    name: 'PPV/Achats',
    value: 25,
    amount: 3112.5,
    color: '#3b82f6',
    trend: 8.3,
  },
  {
    name: 'Tips',
    value: 10,
    amount: 1245,
    color: '#8b5cf6',
    trend: -2.1,
  },
  {
    name: 'Marketplace',
    value: 5,
    amount: 622.5,
    color: '#f59e0b',
    trend: 5.7,
  },
];

export const mockRevenueEvolution: RevenueEvolutionDataPoint[] = [
  {
    date: 'Oct 14',
    revenus_bruts: 2800,
    ppv_achats: 650,
    tips: 280,
    marketplace: 140,
  },
  {
    date: 'Oct 16',
    revenus_bruts: 3200,
    ppv_achats: 720,
    tips: 320,
    marketplace: 160,
  },
  {
    date: 'Oct 18',
    revenus_bruts: 3600,
    ppv_achats: 810,
    tips: 360,
    marketplace: 180,
  },
  {
    date: 'Oct 19',
    revenus_bruts: 4200,
    ppv_achats: 920,
    tips: 420,
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

export const mockBalance = {
  available: 12450,
  pending: 5300,
  nextPayoutDate: 'Oct 25, 2025',
};
