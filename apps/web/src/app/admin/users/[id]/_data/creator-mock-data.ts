import type {
  CreatorProfile,
  CreatorRevenue,
  CreatorRevenueBreakdown,
  CreatorTip,
  CreatorPPVSale,
  CreatorPayoutHistory,
  CreatorContent,
  CreatorContentStats,
  CreatorSubscriber,
  CreatorSubscriberStats,
  CreatorMarketplaceAnnonce,
  CreatorMarketplaceResponse,
  CreatorMarketplaceOrder,
  CreatorMarketplaceStats,
  CreatorReport,
  CreatorSanction,
  CreatorViolation,
  CreatorModerationStats,
  CreatorConversation,
  CreatorMessage,
  CreatorMessagesStats,
  CreatorAnalytics,
  CreatorActivityChart,
  CreatorTopContent,
  CreatorDemographics,
  CreatorSettings,
} from '../_types/creator-types';

// ============================================
// CREATOR PROFILE MOCK DATA
// ============================================

export function generateCreatorProfile(creatorId: string): CreatorProfile {
  return {
    id: creatorId,
    email: 'sarah.johnson@example.com',
    name: 'Sarah Johnson',
    username: '@sarah-johnson',
    createdAt: new Date('2023-01-15'),
    categories: ['Fitness', 'Bien-être', 'Nutrition'],
    status: 'verified',
    isVerified: true,
    lastPublishedAt: new Date('2025-10-28T14:30:00'),
  };
}

// ============================================
// CREATOR REVENUE MOCK DATA
// ============================================

export function generateCreatorRevenue(creatorId: string): CreatorRevenue {
  return {
    totalEarnings: 12450,
    currentMonthEarnings: 2895,
    monthlyRecurring: 1845,
    breakdown: {
      subscriptions: 1845,
      tips: 280,
      ppv: 450,
      marketplace: 320,
      total: 2895,
    },
    subscriptionPlans: {
      basic: { price: 9.99, count: 98 },
      vip: { price: 19.99, count: 45 },
      premium: { price: 29.99, count: 13 },
    },
  };
}

export const creatorTips: CreatorTip[] = [
  {
    id: 'TIP-001',
    fanId: 'fan-001',
    fanName: 'Marc Dubois',
    fanAvatar: '/avatars/fan-001.jpg',
    amount: 50.0,
    message: 'Merci pour tes conseils fitness ! 💪',
    date: new Date('2025-10-25T10:30:00'),
  },
  {
    id: 'TIP-002',
    fanId: 'fan-002',
    fanName: 'Sophie Martin',
    fanAvatar: '/avatars/fan-002.jpg',
    amount: 25.0,
    message: 'Super programme nutrition !',
    date: new Date('2025-10-23T14:20:00'),
  },
  {
    id: 'TIP-003',
    fanId: 'fan-003',
    fanName: 'Thomas Bernard',
    fanAvatar: '/avatars/fan-003.jpg',
    amount: 100.0,
    message: 'Contenu de qualité, continue !',
    date: new Date('2025-10-20T09:15:00'),
  },
  {
    id: 'TIP-004',
    fanId: 'fan-004',
    fanName: 'Julie Petit',
    fanAvatar: '/avatars/fan-004.jpg',
    amount: 15.0,
    date: new Date('2025-10-18T16:45:00'),
  },
  {
    id: 'TIP-005',
    fanId: 'fan-001',
    fanName: 'Marc Dubois',
    fanAvatar: '/avatars/fan-001.jpg',
    amount: 30.0,
    message: 'Excellent coaching !',
    date: new Date('2025-10-15T11:00:00'),
  },
];

export const creatorPPVSales: CreatorPPVSale[] = [
  {
    id: 'PPV-001',
    contentId: 'CONT-025',
    contentTitle: 'Programme nutrition 12 semaines',
    fanId: 'fan-005',
    fanName: 'Emma Rousseau',
    fanAvatar: '/avatars/fan-005.jpg',
    price: 49.99,
    date: new Date('2025-10-27T08:30:00'),
  },
  {
    id: 'PPV-002',
    contentId: 'CONT-018',
    contentTitle: 'Masterclass yoga avancé',
    fanId: 'fan-006',
    fanName: 'Pierre Lefevre',
    fanAvatar: '/avatars/fan-006.jpg',
    price: 29.99,
    date: new Date('2025-10-24T19:15:00'),
  },
  {
    id: 'PPV-003',
    contentId: 'CONT-025',
    contentTitle: 'Programme nutrition 12 semaines',
    fanId: 'fan-007',
    fanName: 'Camille Moreau',
    fanAvatar: '/avatars/fan-007.jpg',
    price: 49.99,
    date: new Date('2025-10-22T14:20:00'),
  },
];

export const creatorPayoutHistory: CreatorPayoutHistory[] = [
  {
    id: 'PAYOUT-001',
    period: 'Octobre 2025',
    grossAmount: 2895.0,
    platformFee: 434.25, // 15%
    netAmount: 2460.75,
    transferDate: new Date('2025-11-05'),
    status: 'pending',
  },
  {
    id: 'PAYOUT-002',
    period: 'Septembre 2025',
    grossAmount: 2650.0,
    platformFee: 397.5,
    netAmount: 2252.5,
    transferDate: new Date('2025-10-05'),
    status: 'completed',
  },
  {
    id: 'PAYOUT-003',
    period: 'Août 2025',
    grossAmount: 2380.0,
    platformFee: 357.0,
    netAmount: 2023.0,
    transferDate: new Date('2025-09-05'),
    status: 'completed',
  },
];

// ============================================
// CREATOR CONTENT MOCK DATA
// ============================================

export function generateCreatorContent(creatorId: string): CreatorContent[] {
  const contents: CreatorContent[] = [];

  // Generate 30 contents with variety
  for (let i = 1; i <= 30; i++) {
    const type = ['video', 'photo', 'audio', 'text'][i % 4] as any;
    const isPPV = i % 8 === 0;
    const isDraft = i % 12 === 0;
    const isArchived = i % 15 === 0;

    let status: any = 'published';
    if (isDraft) status = 'draft';
    else if (isArchived) status = 'archived';
    else if (isPPV) status = 'ppv';

    contents.push({
      id: `CONT-${String(i).padStart(3, '0')}`,
      title: [
        'Routine matinale fitness',
        'Recette healthy du jour',
        'Séance yoga débutant',
        'Conseils nutrition',
        'Exercices abdos',
        'Méditation guidée',
        'Préparation repas semaine',
        'Stretching post-workout',
      ][i % 8] + ` #${i}`,
      type,
      status,
      thumbnail: `/thumbnails/${type}-${i}.jpg`,
      views: Math.floor(Math.random() * 5000) + 100,
      likes: Math.floor(Math.random() * 500) + 10,
      comments: Math.floor(Math.random() * 100) + 1,
      publishedAt: status !== 'draft' ? new Date(Date.now() - i * 24 * 60 * 60 * 1000) : undefined,
      isPPV,
      ppvPrice: isPPV ? [29.99, 49.99, 19.99][i % 3] : undefined,
      isFree: !isPPV && status === 'published',
    });
  }

  return contents;
}

export function generateCreatorContentStats(): CreatorContentStats {
  return {
    totalPublished: 65,
    totalPPV: 12,
    totalFree: 53,
    totalDrafts: 8,
    totalArchived: 16,
  };
}

// ============================================
// CREATOR SUBSCRIBERS MOCK DATA
// ============================================

export function generateCreatorSubscribers(creatorId: string): CreatorSubscriber[] {
  const subscribers: CreatorSubscriber[] = [];

  const plans: Array<{ plan: any; price: number }> = [
    { plan: 'basic', price: 9.99 },
    { plan: 'vip', price: 19.99 },
    { plan: 'premium', price: 29.99 },
  ];

  // Generate 25 subscribers
  for (let i = 1; i <= 25; i++) {
    const planData = plans[i % 3];
    const daysSinceSubscribed = Math.floor(Math.random() * 365) + 1;
    const subscribedDate = new Date(Date.now() - daysSinceSubscribed * 24 * 60 * 60 * 1000);
    const lastPayment = new Date(subscribedDate.getTime() + Math.floor(daysSinceSubscribed / 30) * 30 * 24 * 60 * 60 * 1000);
    const nextRenewal = new Date(lastPayment.getTime() + 30 * 24 * 60 * 60 * 1000);

    subscribers.push({
      id: `SUB-${String(i).padStart(3, '0')}`,
      fanId: `fan-${String(i).padStart(3, '0')}`,
      fanName: [
        'Marc Dubois',
        'Sophie Martin',
        'Thomas Bernard',
        'Julie Petit',
        'Emma Rousseau',
        'Pierre Lefevre',
        'Camille Moreau',
        'Lucas Simon',
        'Marie Laurent',
        'Nicolas Michel',
      ][i % 10],
      fanAvatar: `/avatars/fan-${String(i).padStart(3, '0')}.jpg`,
      fanEmail: `fan${i}@example.com`,
      plan: planData.plan,
      pricePerMonth: planData.price,
      subscribedSince: subscribedDate,
      lastPayment,
      nextRenewal,
      status: i % 20 === 0 ? 'cancelled' : i % 15 === 0 ? 'pending' : 'active',
      totalPaid: Math.floor((daysSinceSubscribed / 30) * planData.price * 100) / 100,
    });
  }

  return subscribers;
}

export function generateCreatorSubscriberStats(): CreatorSubscriberStats {
  return {
    activeSubscribers: 156,
    newThisMonth: 12,
    unsubscribedThisMonth: 8,
    retentionRate: 87.5,
  };
}

// ============================================
// CREATOR MARKETPLACE MOCK DATA
// ============================================

export function generateCreatorMarketplaceAnnonces(creatorId: string): CreatorMarketplaceAnnonce[] {
  return [
    {
      id: 'ANN-001',
      fanId: 'fan-008',
      fanName: 'Alexandre Durand',
      fanAvatar: '/avatars/fan-008.jpg',
      title: 'Programme fitness personnalisé 3 mois',
      description: 'Je cherche un programme fitness sur-mesure pour perdre du poids et me muscler.',
      category: 'Fitness',
      budget: { min: 200, max: 350 },
      deadline: '2025-12-15',
      publishedAt: new Date('2025-10-26T10:00:00'),
      status: 'new',
      responsesCount: 5,
      creatorHasResponded: false,
    },
    {
      id: 'ANN-002',
      fanId: 'fan-009',
      fanName: 'Isabelle Girard',
      fanAvatar: '/avatars/fan-009.jpg',
      title: 'Plan alimentaire végétarien équilibré',
      description: 'Plan repas végétarien pour 1 mois avec liste courses.',
      category: 'Nutrition',
      budget: { min: 80, max: 150 },
      deadline: '2025-11-20',
      publishedAt: new Date('2025-10-24T14:30:00'),
      status: 'responded',
      responsesCount: 8,
      creatorHasResponded: true,
    },
    {
      id: 'ANN-003',
      fanId: 'fan-010',
      fanName: 'François Blanc',
      fanAvatar: '/avatars/fan-010.jpg',
      title: 'Cours yoga en ligne personnalisés',
      description: 'Cours de yoga en visio 2x par semaine pendant 1 mois.',
      category: 'Bien-être',
      budget: { min: 150, max: 250 },
      deadline: '2025-11-30',
      publishedAt: new Date('2025-10-20T09:00:00'),
      status: 'in_progress',
      responsesCount: 3,
      creatorHasResponded: true,
    },
  ];
}

export function generateCreatorMarketplaceResponses(creatorId: string): CreatorMarketplaceResponse[] {
  return [
    {
      id: 'RESP-001',
      annonceId: 'ANN-002',
      creatorId,
      message: 'Bonjour ! Je peux créer un plan alimentaire végétarien équilibré avec recettes détaillées et liste de courses.',
      proposedPrice: 120.0,
      proposedDeadline: '2025-11-15',
      sentAt: new Date('2025-10-24T16:00:00'),
      status: 'pending',
      flags: [],
    },
    {
      id: 'RESP-002',
      annonceId: 'ANN-003',
      creatorId,
      message: 'Je propose 8 cours de yoga en visio personnalisés selon votre niveau.',
      proposedPrice: 200.0,
      proposedDeadline: '2025-11-25',
      sentAt: new Date('2025-10-20T10:30:00'),
      status: 'accepted',
      flags: [],
    },
  ];
}

export function generateCreatorMarketplaceOrders(creatorId: string): CreatorMarketplaceOrder[] {
  return [
    {
      id: 'ORD-001',
      annonceId: 'ANN-003',
      annonceTitle: 'Cours yoga en ligne personnalisés',
      fanId: 'fan-010',
      fanName: 'François Blanc',
      fanAvatar: '/avatars/fan-010.jpg',
      amount: 200.0,
      deadline: new Date('2025-11-25'),
      progress: 40,
      status: 'in_progress',
      startedAt: new Date('2025-10-22'),
    },
    {
      id: 'ORD-002',
      annonceId: 'ANN-004',
      annonceTitle: 'Coaching nutrition 1 mois',
      fanId: 'fan-011',
      fanName: 'Laura Vincent',
      fanAvatar: '/avatars/fan-011.jpg',
      amount: 150.0,
      deadline: new Date('2025-10-30'),
      progress: 95,
      status: 'in_progress',
      startedAt: new Date('2025-10-01'),
    },
  ];
}

export function generateCreatorMarketplaceStats(): CreatorMarketplaceStats {
  return {
    annoncesReceived: 23,
    responsesSent: 18,
    ordersInProgress: 2,
    ordersCompleted: 14,
    averageRating: 4.8,
  };
}

// ============================================
// CREATOR MODERATION MOCK DATA
// ============================================

export function generateCreatorReports(creatorId: string): CreatorReport[] {
  return [
    {
      id: 'REP-001',
      contentId: 'CONT-015',
      contentTitle: 'Séance abdos intense',
      reportedBy: 'fan-020',
      reporterName: 'Antoine Roux',
      reason: 'inappropriate_content',
      description: 'Exercice dangereux sans avertissement',
      date: new Date('2025-10-15'),
      status: 'resolved',
    },
    {
      id: 'REP-002',
      reportedBy: 'fan-021',
      reporterName: 'Céline Garnier',
      reason: 'spam',
      description: 'Sollicitation contact externe répétée',
      date: new Date('2025-09-20'),
      status: 'rejected',
    },
    {
      id: 'REP-003',
      contentId: 'CONT-022',
      contentTitle: 'Programme nutrition',
      reportedBy: 'fan-022',
      reporterName: 'Maxime Bonnet',
      reason: 'other',
      description: 'Informations nutritionnelles incorrectes',
      date: new Date('2025-08-10'),
      status: 'resolved',
    },
  ];
}

export function generateCreatorSanctions(creatorId: string): CreatorSanction[] {
  return [];
}

export function generateCreatorViolations(creatorId: string): CreatorViolation[] {
  return [
    {
      id: 'VIOL-001',
      type: 'auto_detected',
      category: 'external_url',
      description: 'URL externe détectée dans message',
      severity: 'low',
      detectedAt: new Date('2025-10-10'),
      status: 'dismissed',
    },
  ];
}

export function generateCreatorModerationStats(): CreatorModerationStats {
  return {
    totalReports: 3,
    pendingReports: 0,
    contentsRemoved: 0,
    activeSanctions: 0,
  };
}

// ============================================
// CREATOR MESSAGES MOCK DATA
// ============================================

export function generateCreatorConversations(creatorId: string): CreatorConversation[] {
  return [
    {
      id: 'CONV-C001',
      type: 'subscription', // Abonné régulier
      fanId: 'fan-001',
      fanName: 'Marc Dubois',
      fanAvatar: '/avatars/fan-001.jpg',
      messagesCount: 45,
      lastMessageAt: new Date('2025-10-28T14:30:00'),
      lastMessagePreview: 'Merci pour les conseils !',
      severity: 'safe',
      flagsCount: 0,
    },
    {
      id: 'CONV-C002',
      type: 'subscription', // Abonné satisfait
      fanId: 'fan-002',
      fanName: 'Sophie Martin',
      fanAvatar: '/avatars/fan-002.jpg',
      messagesCount: 28,
      lastMessageAt: new Date('2025-10-27T10:15:00'),
      lastMessagePreview: 'Le programme fonctionne super bien',
      severity: 'safe',
      flagsCount: 0,
    },
    {
      id: 'CONV-C003',
      type: 'marketplace', // Marketplace - commande en cours
      fanId: 'fan-003',
      fanName: 'Julie Rousseau',
      fanAvatar: '/avatars/fan-003.jpg',
      messagesCount: 12,
      lastMessageAt: new Date('2025-10-29T16:00:00'),
      lastMessagePreview: 'Super, j\'attends avec impatience !',
      severity: 'safe',
      flagsCount: 0,
    },
    {
      id: 'CONV-C004',
      type: 'marketplace', // Marketplace - FLAG: Creator demand external payment
      fanId: 'fan-004',
      fanName: 'Thomas Petit',
      fanAvatar: '/avatars/fan-004.jpg',
      messagesCount: 8,
      lastMessageAt: new Date('2025-10-26T11:45:00'),
      lastMessagePreview: 'Peux-tu payer via PayPal ?',
      severity: 'critical',
      flagsCount: 2,
    },
    {
      id: 'CONV-C005',
      type: 'subscription', // FLAG: URL externe
      fanId: 'fan-005',
      fanName: 'Laura Dupont',
      fanAvatar: '/avatars/fan-005.jpg',
      messagesCount: 19,
      lastMessageAt: new Date('2025-10-25T09:20:00'),
      lastMessagePreview: 'Rejoins-moi sur Telegram pour plus de contenus',
      severity: 'warning',
      flagsCount: 1,
    },
    {
      id: 'CONV-C006',
      type: 'marketplace', // Marketplace - commande livrée
      fanId: 'fan-006',
      fanName: 'Antoine Bernard',
      fanAvatar: '/avatars/fan-006.jpg',
      messagesCount: 22,
      lastMessageAt: new Date('2025-10-24T14:10:00'),
      lastMessagePreview: 'Merci beaucoup, super travail !',
      severity: 'safe',
      flagsCount: 0,
    },
  ];
}

export function generateCreatorMessages(conversationId: string): CreatorMessage[] {
  if (conversationId === 'CONV-C001') {
    return [
      {
        id: 'MSG-C001',
        conversationId,
        from: 'fan',
        content: 'Salut Sarah ! Peux-tu me conseiller un programme pour débuter ?',
        timestamp: new Date('2025-10-27T10:00:00'),
        read: true,
        flags: [],
      },
      {
        id: 'MSG-C002',
        conversationId,
        from: 'creator',
        content: 'Bonjour Marc ! Bien sûr, je te recommande mon programme débutant disponible dans mes contenus.',
        timestamp: new Date('2025-10-27T10:15:00'),
        read: true,
        flags: [],
      },
      {
        id: 'MSG-C003',
        conversationId,
        from: 'fan',
        content: 'Merci pour les conseils !',
        timestamp: new Date('2025-10-28T14:30:00'),
        read: false,
        flags: [],
      },
    ];
  }
  return [];
}

export function generateCreatorMessagesStats(): CreatorMessagesStats {
  return {
    activeConversations: 12,
    totalMessagesSent: 387,
    flagsDetected: 1,
    uniqueFansContacted: 45,
  };
}

// ============================================
// CREATOR ANALYTICS MOCK DATA
// ============================================

export function generateCreatorAnalytics(creatorId: string): CreatorAnalytics {
  return {
    totalViews: 45320,
    totalWatchTime: 12850, // minutes
    retentionRate: 78.5,
    averageEngagement: 8.5,
    totalLikes: 3845,
    totalComments: 892,
    totalShares: 234,
    interactionRate: 11.2,
  };
}

export function generateCreatorActivityChart(): CreatorActivityChart[] {
  const data: CreatorActivityChart[] = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      views: Math.floor(Math.random() * 2000) + 500,
      newSubscribers: Math.floor(Math.random() * 10) + 1,
      revenue: Math.floor(Math.random() * 200) + 50,
    });
  }
  return data;
}

export function generateCreatorTopContent(): CreatorTopContent[] {
  return [
    {
      id: 'CONT-001',
      title: 'Programme fitness 30 jours',
      type: 'video',
      views: 8520,
      duration: '45:30',
      publishedAt: new Date('2025-09-15'),
    },
    {
      id: 'CONT-012',
      title: 'Routine matinale motivation',
      type: 'video',
      views: 7230,
      duration: '15:45',
      publishedAt: new Date('2025-10-01'),
    },
    {
      id: 'CONT-023',
      title: 'Plan repas semaine healthy',
      type: 'photo',
      views: 6890,
      publishedAt: new Date('2025-10-10'),
    },
    {
      id: 'CONT-008',
      title: 'Yoga débutant 20 minutes',
      type: 'video',
      views: 5640,
      duration: '20:15',
      publishedAt: new Date('2025-09-25'),
    },
    {
      id: 'CONT-019',
      title: 'Méditation guidée stress',
      type: 'audio',
      views: 4820,
      duration: '10:00',
      publishedAt: new Date('2025-10-05'),
    },
  ];
}

export function generateCreatorDemographics(): CreatorDemographics {
  return {
    geography: [
      { country: 'France', percentage: 65 },
      { country: 'Belgique', percentage: 15 },
      { country: 'Suisse', percentage: 10 },
      { country: 'Canada', percentage: 7 },
      { country: 'Autres', percentage: 3 },
    ],
    averageAge: 32,
    genderBreakdown: { male: 35, female: 62, other: 3 },
  };
}

// ============================================
// CREATOR SETTINGS MOCK DATA
// ============================================

export function generateCreatorSettings(creatorId: string): CreatorSettings {
  return {
    accountStatus: {
      emailVerified: true,
      has2FA: true,
      isVerified: true,
      accountAccess: 'active',
    },
    preferences: {
      notificationsEnabled: true,
      language: 'fr',
      timezone: 'Europe/Paris',
      profileVisibility: 'public',
    },
    monetization: {
      basicPrice: 9.99,
      vipPrice: 19.99,
      premiumPrice: 29.99,
      platformCommission: 15,
      paymentMethod: 'bank',
      minimumWithdrawal: 50,
    },
  };
}
