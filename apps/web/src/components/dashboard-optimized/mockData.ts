import type { KPI, BalanceData, UpcomingPayment, RevenueDataPoint, Creator, Activity, RevenueSource, CountryData, FunnelStep } from './types';

export const mockKPIs: KPI[] = [
  {
    label: 'MRR',
    value: '€89,450',
    trend: '+15.7%',
    icon: 'TrendingUp',
    color: 'blue',
  },
  {
    label: 'Nouveaux Créateurs',
    value: '48',
    trend: '+22.1%',
    icon: 'Users',
    color: 'cyan',
  },
  {
    label: 'Taux Conversion',
    value: '34.5%',
    trend: '+4.2%',
    icon: 'Percent',
    color: 'green',
  },
  {
    label: 'Commission Plateforme',
    value: '€18,728',
    trend: '+11.2%',
    icon: 'Euro',
    color: 'purple',
  },
];

export const mockBalance: BalanceData = {
  available: 12450,
  pending: 5300,
  nextPayoutDays: 3,
};

export const mockUpcomingPayments: UpcomingPayment[] = [
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

export const mockEvolution7Days = {
  current: 58000,
  growth: 9.4,
  data: [42000, 45000, 48000, 52000, 54000, 56000, 58000],
};

export const mockRevenueData: RevenueDataPoint[] = [
  { date: 'Oct 14', revenus_bruts: 6800, ppv_achats: 1200, tips: 850, marketplace: 320 },
  { date: 'Oct 15', revenus_bruts: 7200, ppv_achats: 1350, tips: 920, marketplace: 380 },
  { date: 'Oct 16', revenus_bruts: 7800, ppv_achats: 1480, tips: 1020, marketplace: 420 },
  { date: 'Oct 17', revenus_bruts: 8200, ppv_achats: 1580, tips: 1100, marketplace: 460 },
  { date: 'Oct 18', revenus_bruts: 8800, ppv_achats: 1720, tips: 1180, marketplace: 510 },
  { date: 'Oct 19', revenus_bruts: 9200, ppv_achats: 1850, tips: 1250, marketplace: 550 },
  { date: 'Oct 20', revenus_bruts: 9800, ppv_achats: 1980, tips: 1320, marketplace: 590 },
];

export const mockTopCreators: Creator[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    username: 'sophiem',
    avatar: 'SM',
    revenue: 8450,
    trend: [6200, 6800, 7100, 7500, 7900, 8200, 8450],
    growth: 15.2,
    isHot: true,
  },
  {
    id: '2',
    name: 'Lucas Bernard',
    username: 'lucasb',
    avatar: 'LB',
    revenue: 7280,
    trend: [6800, 6900, 7000, 7100, 7150, 7200, 7280],
    growth: 8.1,
    isHot: false,
  },
  {
    id: '3',
    name: 'Emma Dubois',
    username: 'emmad',
    avatar: 'ED',
    revenue: 6950,
    trend: [5500, 5800, 6100, 6400, 6600, 6800, 6950],
    growth: 22.4,
    isHot: true,
  },
  {
    id: '4',
    name: 'Thomas Petit',
    username: 'thomasp',
    avatar: 'TP',
    revenue: 6120,
    trend: [5900, 5950, 6000, 6050, 6080, 6100, 6120],
    growth: 4.2,
    isHot: false,
  },
  {
    id: '5',
    name: 'Léa Moreau',
    username: 'leam',
    avatar: 'LM',
    revenue: 5840,
    trend: [6200, 6100, 6000, 5950, 5900, 5870, 5840],
    growth: -3.1,
    isHot: false,
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'creator_verified',
    user: 'Sophie M.',
    time: 'il y a 2 min',
  },
  {
    id: '2',
    type: 'transaction',
    user: 'Mark D.',
    time: 'il y a 5 min',
    amount: 150,
  },
  {
    id: '3',
    type: 'report_resolved',
    user: 'Alice K.',
    time: 'il y a 15 min',
  },
  {
    id: '4',
    type: 'subscription',
    user: 'John P.',
    time: 'il y a 1h',
    amount: 25,
  },
  {
    id: '5',
    type: 'payout_approved',
    user: 'Emma D.',
    time: 'il y a 2h',
    amount: 3500,
  },
];

export const mockRevenueSources: RevenueSource[] = [
  {
    name: 'Abonnements',
    type: 'subscriptions',
    value: 45,
    amount: 56250,
    color: '#00B8A9',
  },
  {
    name: 'Messages',
    type: 'messages',
    value: 28,
    amount: 35000,
    color: '#3b82f6',
  },
  {
    name: 'Tips',
    type: 'tips',
    value: 15,
    amount: 18750,
    color: '#8b5cf6',
  },
  {
    name: 'PPV',
    type: 'ppv',
    value: 8,
    amount: 10000,
    color: '#f59e0b',
  },
  {
    name: 'Lives',
    type: 'lives',
    value: 4,
    amount: 5000,
    color: '#ec4899',
  },
];

export const mockGeography: CountryData[] = [
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    amount: 56250,
    percentage: 45,
  },
  {
    code: 'BE',
    name: 'Belgique',
    flag: '🇧🇪',
    amount: 35000,
    percentage: 28,
  },
  {
    code: 'CH',
    name: 'Suisse',
    flag: '🇨🇭',
    amount: 18750,
    percentage: 15,
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    amount: 10000,
    percentage: 8,
  },
  {
    code: 'LU',
    name: 'Luxembourg',
    flag: '🇱🇺',
    amount: 5000,
    percentage: 4,
  },
];

export const mockFunnelData: FunnelStep[] = [
  {
    label: 'Visiteurs',
    count: 45200,
    percentage: 100,
  },
  {
    label: 'Inscriptions',
    count: 15600,
    percentage: 34.5,
  },
  {
    label: 'Profils vus',
    count: 8920,
    percentage: 57.2,
  },
  {
    label: 'Abonnements',
    count: 3580,
    percentage: 40.1,
  },
  {
    label: 'Achats PPV',
    count: 1240,
    percentage: 34.6,
  },
];
