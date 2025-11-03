import type {
  FanAnalytics,
  FanFinances,
  FanModeration,
  FanContent,
  FanActivity,
  Subscription,
  Transaction,
  Tip,
  PPVPurchase,
  PaymentMethod,
  Report,
  Sanction,
  FollowedCreator,
  ViewHistory,
  ActivityLog,
  AdminNote,
} from '../_types/fan-types';

// ============================================
// MOCK DATA FOR ROBERT FOX (Fan)
// ============================================

export function generateFanAnalytics(userId: string): FanAnalytics {
  return {
    totalWatchTime: 9000, // 150 hours
    videosWatched: 320,
    avgSessionDuration: 28, // minutes
    totalLikes: 156,
    totalComments: 42,
    totalShares: 18,
    topCreatorsWatched: [
      {
        creatorName: 'Jon Kelly',
        creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jon',
        watchTime: 3200,
        viewCount: 125,
      },
      {
        creatorName: 'Sarah Johnson',
        creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        watchTime: 2100,
        viewCount: 89,
      },
      {
        creatorName: 'Chris Martinez',
        creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
        watchTime: 1800,
        viewCount: 65,
      },
    ],
    activityChart: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      views: Math.floor(Math.random() * 15) + 5,
      watchTime: Math.floor(Math.random() * 120) + 30,
    })),
    connectionHistory: [
      {
        date: new Date('2024-10-28T14:23:00'),
        ip: '192.168.1.42',
        device: 'Chrome on Windows',
        location: 'Paris, France',
      },
      {
        date: new Date('2024-10-27T09:15:00'),
        ip: '192.168.1.42',
        device: 'Safari on iPhone',
        location: 'Paris, France',
      },
      {
        date: new Date('2024-10-26T19:45:00'),
        ip: '192.168.1.42',
        device: 'Chrome on Windows',
        location: 'Paris, France',
      },
    ],
  };
}

export function generateFanFinances(userId: string): FanFinances {
  const subscriptions: Subscription[] = [
    {
      id: 'sub_1',
      creatorId: '2',
      creatorName: 'Jon Kelly',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jon',
      creatorHandle: 'jon-kelly',
      plan: 'Premium',
      amount: 9.99,
      status: 'active',
      startDate: new Date('2024-03-15'),
      nextBilling: new Date('2024-11-15'),
      autoRenew: true,
    },
    {
      id: 'sub_2',
      creatorId: '7',
      creatorName: 'Sarah Johnson',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      creatorHandle: 'sarah-johnson',
      plan: 'VIP',
      amount: 19.99,
      status: 'active',
      startDate: new Date('2024-05-01'),
      nextBilling: new Date('2024-11-01'),
      autoRenew: true,
    },
    {
      id: 'sub_3',
      creatorId: '12',
      creatorName: 'Chris Martinez',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
      creatorHandle: 'chris-martinez',
      plan: 'Basic',
      amount: 4.99,
      status: 'active',
      startDate: new Date('2024-08-20'),
      nextBilling: new Date('2024-11-20'),
      autoRenew: true,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 'tx_1',
      date: new Date('2024-10-15'),
      type: 'subscription',
      description: 'Abonnement @jon-kelly - Premium',
      amount: 9.99,
      status: 'completed',
      creatorName: 'Jon Kelly',
      invoiceUrl: '/invoices/tx_1.pdf',
    },
    {
      id: 'tx_2',
      date: new Date('2024-10-12'),
      type: 'tip',
      description: 'Tip pour @sarah-johnson',
      amount: 15.00,
      status: 'completed',
      creatorName: 'Sarah Johnson',
    },
    {
      id: 'tx_3',
      date: new Date('2024-10-10'),
      type: 'ppv',
      description: 'Photo exclusive - @chris-martinez',
      amount: 12.99,
      status: 'completed',
      creatorName: 'Chris Martinez',
    },
    // Add 22 more transactions...
    ...Array.from({ length: 22 }, (_, i) => ({
      id: `tx_${i + 4}`,
      date: new Date(Date.now() - (i + 5) * 7 * 24 * 60 * 60 * 1000),
      type: (['subscription', 'tip', 'ppv'] as const)[i % 3],
      description: `Transaction ${i + 4}`,
      amount: Math.floor(Math.random() * 30) + 5,
      status: (i % 10 === 0 ? 'pending' : 'completed') as 'pending' | 'completed',
      creatorName: ['Jon Kelly', 'Sarah Johnson', 'Chris Martinez'][i % 3],
      invoiceUrl: i % 2 === 0 ? `/invoices/tx_${i + 4}.pdf` : undefined,
    })),
  ];

  const tips: Tip[] = [
    {
      id: 'tip_1',
      creatorId: '2',
      creatorName: 'Jon Kelly',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jon',
      amount: 15.00,
      message: 'Excellent contenu, continue comme ça !',
      date: new Date('2024-10-12'),
    },
    {
      id: 'tip_2',
      creatorId: '7',
      creatorName: 'Sarah Johnson',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      amount: 10.00,
      date: new Date('2024-10-08'),
    },
    ...Array.from({ length: 43 }, (_, i) => ({
      id: `tip_${i + 3}`,
      creatorId: ['2', '7', '12'][i % 3],
      creatorName: ['Jon Kelly', 'Sarah Johnson', 'Chris Martinez'][i % 3],
      creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${['Jon', 'Sarah', 'Chris'][i % 3]}`,
      amount: Math.floor(Math.random() * 20) + 5,
      message: i % 3 === 0 ? 'Merci pour le contenu !' : undefined,
      date: new Date(Date.now() - (i + 3) * 5 * 24 * 60 * 60 * 1000),
    })),
  ];

  const ppvPurchases: PPVPurchase[] = [
    {
      id: 'ppv_1',
      contentId: 'content_1',
      title: 'Behind the Scenes - Photoshoot',
      thumbnail: 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?w=400&h=300&fit=crop',
      creatorName: 'Sarah Johnson',
      price: 12.99,
      purchaseDate: new Date('2024-10-10'),
      type: 'album',
    },
    {
      id: 'ppv_2',
      contentId: 'content_2',
      title: 'Exclusive Video Session',
      thumbnail: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&h=300&fit=crop',
      creatorName: 'Jon Kelly',
      price: 19.99,
      purchaseDate: new Date('2024-09-28'),
      type: 'video',
    },
    ...Array.from({ length: 6 }, (_, i) => ({
      id: `ppv_${i + 3}`,
      contentId: `content_${i + 3}`,
      title: `Exclusive Content ${i + 3}`,
      thumbnail: `https://images.unsplash.com/photo-${1500000000000 + i * 1000000}?w=400&h=300&fit=crop`,
      creatorName: ['Jon Kelly', 'Sarah Johnson', 'Chris Martinez'][i % 3],
      price: Math.floor(Math.random() * 15) + 10,
      purchaseDate: new Date(Date.now() - (i + 5) * 10 * 24 * 60 * 60 * 1000),
      type: (['image', 'video', 'album'] as const)[i % 3],
    })),
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'pm_1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2026,
      isDefault: true,
    },
    {
      id: 'pm_2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expiryMonth: 8,
      expiryYear: 2025,
      isDefault: false,
    },
  ];

  const totalSpent = transactions
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    subscriptions,
    transactions,
    tips,
    ppvPurchases,
    paymentMethods,
    totalSpent,
    monthlyAverage: totalSpent / 6, // 6 months
  };
}

export function generateFanModeration(userId: string): FanModeration {
  const reports: Report[] = [
    {
      id: 'rep_1',
      date: new Date('2024-09-15'),
      reason: 'Spam dans les commentaires',
      reportedBy: 'Emma Wilson',
      reportedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
      content: 'Regardez ma chaîne YouTube !!!',
      contentType: 'comment',
      status: 'reviewed',
      reviewedBy: 'Admin Team',
      reviewedAt: new Date('2024-09-16'),
      action: 'Warning issued',
    },
    {
      id: 'rep_2',
      date: new Date('2024-07-22'),
      reason: 'Commentaire inapproprié',
      reportedBy: 'Jon Kelly',
      reportedByAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jon',
      content: 'Commentaire limite...',
      contentType: 'comment',
      status: 'dismissed',
      reviewedBy: 'Admin Team',
      reviewedAt: new Date('2024-07-23'),
      action: 'No action needed',
    },
  ];

  const sanctions: Sanction[] = [];

  const adminNotes: AdminNote[] = [
    {
      id: 'note_1',
      content: 'Utilisateur actif, bon engagement, aucun problème majeur.',
      createdBy: 'Admin Team',
      createdAt: new Date('2024-09-16'),
    },
  ];

  const flaggedComments = [
    {
      id: 'fc_1',
      content: 'Regardez ma chaîne YouTube !!!',
      videoTitle: 'Training Session #12',
      date: new Date('2024-09-15'),
      reason: 'Spam',
    },
  ];

  return {
    reports,
    sanctions,
    adminNotes,
    flaggedComments,
  };
}

export function generateFanContent(userId: string): FanContent {
  const followedCreators: FollowedCreator[] = [
    {
      id: 'fc_1',
      creatorId: '2',
      creatorName: 'Jon Kelly',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jon',
      creatorHandle: 'jon-kelly',
      followedAt: new Date('2024-02-10'),
      isSubscribed: true,
    },
    {
      id: 'fc_2',
      creatorId: '7',
      creatorName: 'Sarah Johnson',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      creatorHandle: 'sarah-johnson',
      followedAt: new Date('2024-04-15'),
      isSubscribed: true,
    },
    {
      id: 'fc_3',
      creatorId: '12',
      creatorName: 'Chris Martinez',
      creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris',
      creatorHandle: 'chris-martinez',
      followedAt: new Date('2024-08-01'),
      isSubscribed: true,
    },
    ...Array.from({ length: 9 }, (_, i) => ({
      id: `fc_${i + 4}`,
      creatorId: `${i + 10}`,
      creatorName: `Creator ${i + 4}`,
      creatorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=Creator${i + 4}`,
      creatorHandle: `creator-${i + 4}`,
      followedAt: new Date(Date.now() - (i + 1) * 30 * 24 * 60 * 60 * 1000),
      isSubscribed: false,
    })),
  ];

  const favorites = [
    {
      id: 'fav_1',
      contentId: 'content_101',
      title: 'Workout Routine - Full Body',
      thumbnail: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=300&fit=crop',
      creatorName: 'Jon Kelly',
      addedAt: new Date('2024-10-01'),
    },
    {
      id: 'fav_2',
      contentId: 'content_102',
      title: 'Yoga Flow Morning Session',
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=300&fit=crop',
      creatorName: 'Sarah Johnson',
      addedAt: new Date('2024-09-20'),
    },
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `fav_${i + 3}`,
      contentId: `content_${i + 103}`,
      title: `Favorite Content ${i + 3}`,
      thumbnail: `https://images.unsplash.com/photo-${1540000000000 + i * 1000000}?w=400&h=300&fit=crop`,
      creatorName: ['Jon Kelly', 'Sarah Johnson', 'Chris Martinez'][i % 3],
      addedAt: new Date(Date.now() - (i + 3) * 7 * 24 * 60 * 60 * 1000),
    })),
  ];

  const viewHistory: ViewHistory[] = Array.from({ length: 20 }, (_, i) => ({
    id: `vh_${i + 1}`,
    contentId: `content_${200 + i}`,
    contentTitle: `Video Title ${i + 1}`,
    contentThumbnail: `https://images.unsplash.com/photo-${1550000000000 + i * 1000000}?w=400&h=300&fit=crop`,
    creatorName: ['Jon Kelly', 'Sarah Johnson', 'Chris Martinez'][i % 3],
    viewedAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
    duration: Math.floor(Math.random() * 1200) + 300, // 5-25 min
    progress: Math.floor(Math.random() * 100),
  }));

  const finances = generateFanFinances(userId);

  return {
    followedCreators,
    activeSubscriptions: finances.subscriptions,
    ppvLibrary: finances.ppvPurchases,
    favorites,
    viewHistory,
  };
}

export function generateFanActivity(userId: string, page: number = 1): FanActivity {
  const logsPerPage = 50;
  const totalLogs = 200;

  const activityTypes = ['login', 'purchase', 'subscription', 'like', 'comment', 'follow', 'view'] as const;

  const allLogs: ActivityLog[] = Array.from({ length: totalLogs }, (_, i) => {
    const type = activityTypes[i % activityTypes.length];
    const date = new Date(Date.now() - i * 6 * 60 * 60 * 1000);

    const descriptions: Record<typeof type, string> = {
      login: 'Connexion depuis Chrome on Windows',
      purchase: 'Achat PPV - Exclusive Content',
      subscription: 'Renouvellement abonnement @jon-kelly',
      like: 'A aimé une vidéo de Sarah Johnson',
      comment: 'A commenté sur une vidéo',
      follow: 'A suivi Chris Martinez',
      view: 'A regardé "Training Session #12"',
    };

    return {
      id: `log_${i + 1}`,
      type,
      description: descriptions[type],
      timestamp: date,
      metadata: {
        ip: '192.168.1.42',
        device: i % 2 === 0 ? 'Chrome on Windows' : 'Safari on iPhone',
      },
    };
  });

  const startIndex = (page - 1) * logsPerPage;
  const logs = allLogs.slice(startIndex, startIndex + logsPerPage);

  return {
    logs,
    totalPages: Math.ceil(totalLogs / logsPerPage),
    currentPage: page,
  };
}
