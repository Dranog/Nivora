export const dashboardData = {
  kpis: {
    totalRevenue: { value: 45231, change: 23.1 },
    activeUsers: { value: 2547, change: 12.5 },
    transactions: { value: 1234, change: 8.2 },
    avgRevenuePerCreator: { value: 1847, change: 15.3 }
  },
  balance: {
    available: 12450,
    pending: 5300
  },
  upcomingPayouts: [
    { days: 3, amount: 3500, status: 'released' as const },
    { days: 15, amount: 1800, status: 'pending' as const }
  ],
  topCreators: [
    { name: 'Sophie M.', avatar: 'SM', revenue: 15240 },
    { name: 'Mark D.', avatar: 'MD', revenue: 12890 },
    { name: 'Alice K.', avatar: 'AK', revenue: 9450 },
    { name: 'John P.', avatar: 'JP', revenue: 8120 },
    { name: 'Emma L.', avatar: 'EL', revenue: 7890 }
  ],
  recentActivity: [
    { type: 'creator_verified' as const, user: 'Alice K.', time: '2 min' },
    { type: 'transaction' as const, user: 'Sophie M.', amount: 58, time: '5 min' },
    { type: 'report_resolved' as const, user: 'System', time: '12 min' },
    { type: 'subscription' as const, user: 'Mark D.', time: '18 min' },
    { type: 'payout_approved' as const, user: 'Emma L.', amount: 1200, time: '25 min' }
  ],
  revenueChart: {
    labels: ['Oct 14', 'Oct 15', 'Oct 16', 'Oct 17', 'Oct 18', 'Oct 19'],
    datasets: [
      {
        label: 'Revenus bruts',
        data: [4200, 5200, 5800, 6800, 7400, 7600],
        color: '#06b6d4',
        change: 76
      },
      {
        label: 'PPV/Achats',
        data: [800, 950, 1100, 1150, 1200, 1250],
        color: '#3b82f6',
        change: 11
      },
      {
        label: 'Tips/Pourboires',
        data: [600, 700, 750, 800, 850, 900],
        color: '#a855f7',
        change: 10
      },
      {
        label: 'Marketplace',
        data: [500, 480, 460, 450, 440, 420],
        color: '#f97316',
        change: -5
      }
    ]
  },
  revenueSources: [
    { name: 'Abonnements', value: 60, amount: 12450, color: '#06b6d4' },
    { name: 'PPV/Achats', value: 11, amount: 2290, color: '#3b82f6' },
    { name: 'Tips', value: 10, amount: 2080, color: '#a855f7' },
    { name: 'Marketplace', value: 5, amount: 1040, color: '#f97316' }
  ],
  quickStats: {
    activeCreators: 847,
    conversionRate: 4.2,
    retentionRate: 87,
    openTickets: 12
  }
};
