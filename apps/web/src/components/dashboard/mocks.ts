import { CheckCircle, DollarSign, AlertCircle, UserPlus, TrendingDown, Video, Users, Clock, RefreshCw, MessageSquare, Reply, FileText, Heart } from 'lucide-react';
import type {
  KPIData,
  Creator,
  RevenueDataPoint,
  Activity,
  RevenueSource,
  Country,
  FunnelStep,
  UpcomingPayment,
  BalanceData,
  Evolution7dData,
  LiveStatsMetric,
  EngagementMetric,
} from './types';

export const mockKPIs: KPIData[] = [
  {
    icon: 'TrendingUp',
    iconColor: 'blue',
    label: 'MRR',
    value: '€89,450',
    trend: '+15.7%',
  },
  {
    icon: 'Users',
    iconColor: 'cyan',
    label: 'Nouveaux Créateurs',
    value: '48',
    trend: '+22.1%',
  },
  {
    icon: 'Percent',
    iconColor: 'green',
    label: 'Taux Conversion',
    value: '34.5%',
    trend: '+4.2%',
  },
  {
    icon: 'Euro',
    iconColor: 'purple',
    label: 'Commission Plateforme',
    value: '€18,728',
    trend: '+11.2%',
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

export const mockEvolution7d: Evolution7dData = {
  current: 58000,
  growth: 9.4,
  sparklineData: [42000, 45000, 48000, 52000, 54000, 56000, 58000],
};

export const mockRevenueData: RevenueDataPoint[] = [
  { date: 'Oct 14', revenus: 6800, ppv: 1200, tips: 850, marketplace: 320 },
  { date: 'Oct 15', revenus: 7200, ppv: 1350, tips: 920, marketplace: 380 },
  { date: 'Oct 16', revenus: 7800, ppv: 1480, tips: 1020, marketplace: 420 },
  { date: 'Oct 17', revenus: 8200, ppv: 1580, tips: 1100, marketplace: 460 },
  { date: 'Oct 18', revenus: 8800, ppv: 1720, tips: 1180, marketplace: 510 },
  { date: 'Oct 19', revenus: 9200, ppv: 1850, tips: 1250, marketplace: 550 },
];

export const mockTopCreators: Creator[] = [
  {
    id: '1',
    name: 'Sophie Martin',
    username: 'sophiem',
    avatar: 'SM',
    amount: 8450,
    trend: 15.2,
    sparklineData: [6200, 6800, 7100, 7500, 7900, 8200, 8450],
    isHot: true,
  },
  {
    id: '2',
    name: 'Lucas Bernard',
    username: 'lucasb',
    avatar: 'LB',
    amount: 7280,
    trend: 8.1,
    sparklineData: [6800, 6900, 7000, 7100, 7150, 7200, 7280],
    isHot: true,
  },
  {
    id: '3',
    name: 'Emma Dubois',
    username: 'emmad',
    avatar: 'ED',
    amount: 6950,
    trend: 22.4,
    sparklineData: [5500, 5800, 6100, 6400, 6600, 6800, 6950],
    isHot: true,
  },
  {
    id: '4',
    name: 'Thomas Petit',
    username: 'thomasp',
    avatar: 'TP',
    amount: 6120,
    trend: 4.2,
    sparklineData: [5900, 5950, 6000, 6050, 6080, 6100, 6120],
  },
  {
    id: '5',
    name: 'Léa Moreau',
    username: 'leam',
    avatar: 'LM',
    amount: 5840,
    trend: -3.1,
    sparklineData: [6200, 6100, 6000, 5950, 5900, 5870, 5840],
  },
];

export const mockTopCreatorsExtended: Creator[] = [
  ...mockTopCreators,
  {
    id: '6',
    name: 'Nathan Roux',
    username: 'nathanr',
    avatar: 'NR',
    amount: 5620,
    trend: 6.8,
    sparklineData: [],
  },
  {
    id: '7',
    name: 'Camille Blanc',
    username: 'camilleb',
    avatar: 'CB',
    amount: 5340,
    trend: -1.2,
    sparklineData: [],
  },
  {
    id: '8',
    name: 'Hugo Garnier',
    username: 'hugog',
    avatar: 'HG',
    amount: 5120,
    trend: 3.4,
    sparklineData: [],
  },
  {
    id: '9',
    name: 'Chloé Faure',
    username: 'chloef',
    avatar: 'CF',
    amount: 4890,
    trend: 7.9,
    sparklineData: [],
  },
  {
    id: '10',
    name: 'Louis Mercier',
    username: 'louism',
    avatar: 'LM',
    amount: 4650,
    trend: 2.1,
    sparklineData: [],
  },
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'verified',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
    text: 'Sophie M. a été vérifiée',
    timestamp: 'il y a 2 min',
  },
  {
    id: '2',
    type: 'transaction',
    icon: DollarSign,
    iconColor: 'text-blue-600',
    text: 'Nouvelle transaction €150',
    timestamp: 'il y a 5 min',
  },
  {
    id: '3',
    type: 'report',
    icon: AlertCircle,
    iconColor: 'text-orange-600',
    text: 'Signalement résolu',
    timestamp: 'il y a 15 min',
  },
  {
    id: '4',
    type: 'subscription',
    icon: UserPlus,
    iconColor: 'text-cyan-600',
    text: 'Nouvel abonnement John P.',
    timestamp: 'il y a 1h',
  },
  {
    id: '5',
    type: 'withdrawal',
    icon: TrendingDown,
    iconColor: 'text-purple-600',
    text: 'Retrait approuvé €3,500',
    timestamp: 'il y a 2h',
  },
];

export const mockRevenueSources: RevenueSource[] = [
  {
    name: 'Abonnements',
    value: 56250,
    percentage: 45,
    color: '#06b6d4',
  },
  {
    name: 'Messages',
    value: 35000,
    percentage: 28,
    color: '#3b82f6',
  },
  {
    name: 'Tips',
    value: 18750,
    percentage: 15,
    color: '#8b5cf6',
  },
  {
    name: 'PPV',
    value: 10000,
    percentage: 8,
    color: '#f59e0b',
  },
  {
    name: 'Lives',
    value: 5000,
    percentage: 4,
    color: '#ec4899',
  },
];

export const mockCountries: Country[] = [
  {
    name: 'France',
    flag: '🇫🇷',
    amount: 56250,
    percentage: 45,
  },
  {
    name: 'Belgique',
    flag: '🇧🇪',
    amount: 35000,
    percentage: 28,
  },
  {
    name: 'Suisse',
    flag: '🇨🇭',
    amount: 18750,
    percentage: 15,
  },
  {
    name: 'Canada',
    flag: '🇨🇦',
    amount: 10000,
    percentage: 8,
  },
  {
    name: 'Luxembourg',
    flag: '🇱🇺',
    amount: 5000,
    percentage: 4,
  },
];

export const mockFunnelSteps: FunnelStep[] = [
  {
    label: 'Visiteurs',
    value: 45200,
    percentage: 100,
  },
  {
    label: 'Inscriptions',
    value: 15600,
    percentage: 80,
  },
  {
    label: 'Profils vus',
    value: 8920,
    percentage: 60,
  },
  {
    label: 'Abonnements',
    value: 3580,
    percentage: 40,
  },
  {
    label: 'Achats PPV',
    value: 1240,
    percentage: 20,
  },
];

export const mockLiveStats: LiveStatsMetric[] = [
  {
    icon: Video,
    iconColor: 'pink',
    value: '12',
    label: 'En direct maintenant',
    badge: '-4 vs hier',
    badgeVariant: 'red',
  },
  {
    icon: Users,
    iconColor: 'purple',
    value: '2,845',
    label: 'Spectateurs actifs',
    badge: '+18% vs hier',
    badgeVariant: 'green',
  },
  {
    icon: Clock,
    iconColor: 'blue',
    value: '42 min',
    label: 'Par session',
    badge: '+5 min vs moyenne',
    badgeVariant: 'green',
  },
  {
    icon: DollarSign,
    iconColor: 'cyan',
    value: '€1,248',
    label: 'Pendant les lives',
    badge: '+22% vs hier',
    badgeVariant: 'green',
  },
];

export const mockEngagementMetrics: EngagementMetric[] = [
  {
    icon: RefreshCw,
    iconColor: 'green',
    value: '87.3%',
    label: 'Rétention 30 jours',
    progressBar: 87.3,
  },
  {
    icon: MessageSquare,
    iconColor: 'blue',
    value: '156',
    label: 'Par créateur actif',
    badge: '+12% vs semaine dernière',
    badgeVariant: 'green',
  },
  {
    icon: Reply,
    iconColor: 'purple',
    value: '92.5%',
    label: 'Réponse sous 24h',
    progressBar: 92.5,
  },
  {
    icon: FileText,
    iconColor: 'orange',
    value: '4.2',
    label: 'Moyenne par jour',
    badge: '+0.8 vs mois dernier',
    badgeVariant: 'green',
  },
  {
    icon: Heart,
    iconColor: 'pink',
    value: '4.8/5',
    label: 'Note moyenne fans',
  },
];
