/**
 * Creator Data Hooks - DEMO MODE
 * Uses mock data instead of real API calls
 * Sprint 4 - Mock Data Implementation
 */

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminToasts } from '@/lib/toasts';
import * as MockData from '../_data/creator-mock-data';
import type { CreatorSettings } from '../_types/creator-types';

// ============================================================================
// TYPES (kept from original)
// ============================================================================

export interface CreatorOverview {
  userId: string;
  totalRevenue: number;
  revenueThisMonth: number;
  totalSubscribers: number;
  activeSubscribers: number;
  totalPosts: number;
  totalContent: number;
  averageEngagement: number;
  subscriptionPrice: number;
  recentRevenue: {
    date: string;
    total: number;
    subscriptions: number;
    ppv: number;
    tips: number;
  }[];
  recentSubscribers: {
    id: string;
    userId: string;
    userName: string;
    userHandle: string;
    userAvatar: string | null;
    amount: number;
    startDate: string;
  }[];
  topPosts: {
    id: string;
    caption: string | null;
    likesCount: number;
    commentsCount: number;
    revenueGenerated: number;
    createdAt: string;
  }[];
}

export interface CreatorRevenue {
  total: number;
  thisMonth: number;
  lastMonth: number;
  trend: {
    date: string;
    total: number;
    subscriptions: number;
    ppv: number;
    tips: number;
    marketplace: number;
  }[];
  bySource: {
    subscriptions: number;
    ppv: number;
    tips: number;
    marketplace: number;
  };
  topEarningPosts: {
    id: string;
    caption: string | null;
    revenue: number;
    type: 'SUBSCRIPTION' | 'PPV';
    createdAt: string;
  }[];
}

export interface CreatorSubscriber {
  id: string;
  userId: string;
  userName: string;
  userHandle: string;
  userEmail: string;
  userAvatar: string | null;
  amount: number;
  startDate: string;
  renewDate: string | null;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  autoRenew: boolean;
  totalPaid: number;
  lifetimeValue: number;
}

export interface CreatorSubscriberStats {
  total: number;
  active: number;
  cancelled: number;
  expired: number;
  newThisMonth: number;
  churnRate: number;
  averageLifetime: number;
  trend: {
    date: string;
    total: number;
    new: number;
    cancelled: number;
  }[];
}

export interface CreatorContent {
  id: string;
  type: 'POST' | 'VIDEO' | 'IMAGE' | 'GALLERY';
  caption: string | null;
  price: number | null;
  isPPV: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  revenueGenerated: number;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'TAKEN_DOWN';
  createdAt: string;
}

export interface CreatorContentStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  archivedPosts: number;
  takenDownPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  averageEngagement: number;
  topPerformingPosts: {
    id: string;
    caption: string | null;
    views: number;
    likes: number;
    engagement: number;
  }[];
}

export interface CreatorAnalytics {
  performance: {
    views: { total: number; thisMonth: number; trend: { date: string; count: number }[] };
    likes: { total: number; thisMonth: number; trend: { date: string; count: number }[] };
    comments: { total: number; thisMonth: number; trend: { date: string; count: number }[] };
    shares: { total: number; thisMonth: number; trend: { date: string; count: number }[] };
    engagementRate: number;
  };
  audience: {
    totalFollowers: number;
    newFollowersThisMonth: number;
    demographics: {
      age: { range: string; count: number }[];
      gender: { type: string; count: number }[];
      location: { country: string; count: number }[];
    };
  };
  content: {
    totalPosts: number;
    postsThisMonth: number;
    averagePostsPerWeek: number;
    mostEngagingType: 'VIDEO' | 'IMAGE' | 'GALLERY';
  };
}

export interface CreatorPerformance {
  subscriberGrowth: number;
  revenueGrowth: number;
  engagementGrowth: number;
  contentOutputGrowth: number;
  performanceScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CreatorTransaction {
  id: string;
  type: 'SUBSCRIPTION' | 'PPV' | 'TIP' | 'MARKETPLACE' | 'PAYOUT';
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  description: string;
  fanName?: string;
  createdAt: string;
}

export interface CreatorPayout {
  id: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  requestedAt: string;
  processedAt?: string;
  method: 'BANK_TRANSFER' | 'PAYPAL';
  accountDetails: string;
  failureReason?: string;
}

export interface CreatorBalance {
  available: number;
  pending: number;
  total: number;
  nextPayoutDate: string;
  minimumPayout: number;
  currency: string;
  recentTransactions: {
    id: string;
    type: 'EARNING' | 'PAYOUT' | 'FEE' | 'REFUND';
    amount: number;
    description: string;
    createdAt: string;
  }[];
}

export interface CreatorMessage {
  id: string;
  conversationId: string;
  fanId: string;
  fanName: string;
  fanHandle: string;
  fanAvatar: string | null;
  content: string | null;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PPV_LOCKED' | 'PPV_UNLOCKED';
  price?: number;
  isRead: boolean;
  createdAt: string;
  senderId: string;
}

export interface CreatorRequest {
  id: string;
  fanId: string;
  fanName: string;
  fanHandle: string;
  title: string;
  description: string;
  offerPrice: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface CreatorModerationHistory {
  id: string;
  type: 'WARNING' | 'POST_TAKEDOWN' | 'SUSPENSION' | 'CONTENT_REVIEW';
  targetType: 'POST' | 'PROFILE' | 'ACCOUNT';
  targetId: string | null;
  reason: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface CreatorFlag {
  id: string;
  type: 'SPAM' | 'INAPPROPRIATE_CONTENT' | 'COPYRIGHT' | 'SUSPICIOUS_ACTIVITY' | 'POLICY_VIOLATION';
  reason: string;
  description: string;
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface CreatorProfile {
  userId: string;
  displayName: string;
  username?: string;
  bio: string | null;
  subscriptionPrice: number;
  category: string[];
  profilePicture: string | null;
  coverImage: string | null;
  socialLinks: {
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  settings: CreatorSettings;
}

// Filters
export interface CreatorPostsFilters {
  status?: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'TAKEN_DOWN';
  type?: 'POST' | 'VIDEO' | 'IMAGE' | 'GALLERY';
  isPPV?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'views' | 'likes' | 'revenue';
  sortOrder?: 'asc' | 'desc';
}

export interface CreatorSubscribersFilters {
  status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  page?: number;
  limit?: number;
  sortBy?: 'startDate' | 'amount' | 'lifetimeValue';
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// QUERY KEYS (kept for compatibility)
// ============================================================================

export const creatorKeys = {
  all: (userId: string) => ['admin', 'users', userId, 'creator'] as const,
  overview: (userId: string) => [...creatorKeys.all(userId), 'overview'] as const,
  revenue: (userId: string) => [...creatorKeys.all(userId), 'revenue'] as const,
  subscribers: (userId: string, filters?: CreatorSubscribersFilters) =>
    [...creatorKeys.all(userId), 'subscribers', filters || {}] as const,
  subscriberStats: (userId: string) => [...creatorKeys.all(userId), 'subscriber-stats'] as const,
  content: (userId: string, filters?: CreatorPostsFilters) =>
    [...creatorKeys.all(userId), 'content', filters || {}] as const,
  contentStats: (userId: string) => [...creatorKeys.all(userId), 'content-stats'] as const,
  analytics: (userId: string) => [...creatorKeys.all(userId), 'analytics'] as const,
  performance: (userId: string) => [...creatorKeys.all(userId), 'performance'] as const,
  transactions: (userId: string) => [...creatorKeys.all(userId), 'transactions'] as const,
  payouts: (userId: string) => [...creatorKeys.all(userId), 'payouts'] as const,
  balance: (userId: string) => [...creatorKeys.all(userId), 'balance'] as const,
  messages: (userId: string) => [...creatorKeys.all(userId), 'messages'] as const,
  requests: (userId: string) => [...creatorKeys.all(userId), 'requests'] as const,
  moderationHistory: (userId: string) => [...creatorKeys.all(userId), 'moderation-history'] as const,
  flags: (userId: string) => [...creatorKeys.all(userId), 'flags'] as const,
  profile: (userId: string) => [...creatorKeys.all(userId), 'profile'] as const,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Simulates network delay for realistic demo behavior
 */
function simulateNetworkDelay(): Promise<void> {
  const delay = 300 + Math.random() * 500; // 300-800ms
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Creates a mock query result with loading simulation
 */
function createMockQuery<T>(data: T, hookName: string, userId: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadData = async () => {
      console.log(`🎭 [DEMO MODE] ${hookName} - Loading for user ${userId}`);
      await simulateNetworkDelay();
      console.log(`✅ [DEMO MODE] ${hookName} - Data loaded`);
      setIsLoading(false);
    };

    loadData();
  }, [userId]);

  const refetch = async () => {
    console.log(`🔄 [DEMO MODE] ${hookName} - Refetch called`);
    setIsLoading(true);
    await simulateNetworkDelay();
    setIsLoading(false);
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    isSuccess: !isLoading && !error,
    isError: !!error,
  };
}

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

function getMockCreatorOverview(userId: string): CreatorOverview {
  const revenue = MockData.generateCreatorRevenue(userId);
  const subscribers = MockData.generateCreatorSubscribers(userId);
  const content = MockData.generateCreatorContent(userId);

  return {
    userId,
    totalRevenue: revenue.totalEarnings,
    revenueThisMonth: revenue.currentMonthEarnings,
    totalSubscribers: subscribers.length,
    activeSubscribers: subscribers.filter(s => s.status === 'active').length,
    totalPosts: content.length,
    totalContent: content.length,
    averageEngagement: 12.5,
    subscriptionPrice: 9.99,
    recentRevenue: [
      {
        date: new Date().toISOString(),
        total: revenue.currentMonthEarnings,
        subscriptions: revenue.breakdown.subscriptions,
        ppv: revenue.breakdown.ppv,
        tips: revenue.breakdown.tips,
      },
    ],
    recentSubscribers: subscribers.slice(0, 5).map(s => ({
      id: s.id,
      userId: s.fanId,
      userName: s.fanName,
      userHandle: s.fanName.toLowerCase().replace(' ', ''),
      userAvatar: s.fanAvatar,
      amount: s.pricePerMonth,
      startDate: s.subscribedSince.toISOString(),
    })),
    topPosts: content.slice(0, 5).map(c => ({
      id: c.id,
      caption: c.title,
      likesCount: c.likes,
      commentsCount: c.comments,
      revenueGenerated: c.isPPV ? (c.ppvPrice || 0) * c.views * 0.1 : 0,
      createdAt: c.publishedAt ? c.publishedAt.toISOString() : new Date().toISOString(),
    })),
  };
}

function getMockCreatorRevenue(userId: string) {
  const revenue = MockData.generateCreatorRevenue(userId);
  const tips = MockData.creatorTips || [];
  const ppvSales = MockData.creatorPPVSales || [];
  const payoutHistory = MockData.creatorPayoutHistory || [];
  const subscribers = MockData.generateCreatorSubscribers(userId);

  return {
    revenue: revenue,
    tips: tips,
    ppvSales: ppvSales,
    payoutHistory: payoutHistory,
    activeSubscribers: (subscribers || []).filter((s: any) => s.status === 'active'),
    marketplaceTransactions: [],
  };
}

function getMockCreatorSubscribers(userId: string, filters?: CreatorSubscribersFilters) {
  // Return subscribers from creator-types.ts format directly
  return MockData.generateCreatorSubscribers(userId);
}

function getMockCreatorSubscriberStats(userId: string) {
  const subscribers = MockData.generateCreatorSubscribers(userId);
  const active = subscribers.filter(s => s.status === 'active').length;

  return {
    activeSubscribers: active,
    newThisMonth: Math.floor(subscribers.length * 0.15),
    unsubscribedThisMonth: Math.floor(subscribers.length * 0.08),
    retentionRate: 91.5,
  };
}

function getMockCreatorContent(userId: string, filters?: CreatorPostsFilters): CreatorContent[] {
  const content = MockData.generateCreatorContent(userId);

  return content.map(c => ({
    id: c.id,
    type: c.type as 'POST' | 'VIDEO' | 'IMAGE' | 'GALLERY',
    caption: c.title || null,
    price: c.isPPV ? c.ppvPrice : null,
    isPPV: c.isPPV,
    likesCount: c.likes,
    commentsCount: c.comments,
    viewsCount: c.views,
    revenueGenerated: c.isPPV ? (c.ppvPrice || 0) * c.views * 0.1 : 0,
    status: c.status as 'PUBLISHED' | 'DRAFT' | 'ARCHIVED' | 'TAKEN_DOWN',
    createdAt: c.publishedAt ? c.publishedAt.toISOString() : new Date().toISOString(),
  })) as CreatorContent[];
}

function getMockCreatorContentStats(userId: string): CreatorContentStats {
  const content = MockData.generateCreatorContent(userId);

  return {
    totalPosts: content.length,
    publishedPosts: content.filter(c => c.status === 'published').length,
    draftPosts: content.filter(c => c.status === 'draft').length,
    archivedPosts: 0,
    takenDownPosts: 0,
    totalViews: content.reduce((sum, c) => sum + c.views, 0),
    totalLikes: content.reduce((sum, c) => sum + c.likes, 0),
    totalComments: content.reduce((sum, c) => sum + c.comments, 0),
    averageEngagement: 12.5,
    topPerformingPosts: content.slice(0, 5).map(c => ({
      id: c.id,
      caption: c.title,
      views: c.views,
      likes: c.likes,
      engagement: (c.likes + c.comments) / c.views * 100,
    })),
  };
}

function getMockCreatorAnalytics(userId: string): CreatorAnalytics {
  const analytics = MockData.generateCreatorAnalytics(userId);

  // Generate activity chart data (30 days)
  const activityChart = MockData.generateCreatorActivityChart();

  // Get demographics data
  const demographics = MockData.generateCreatorDemographics();

  // Calculate derived values
  const monthlyViews = Math.floor((analytics?.totalViews || 0) * 0.15);
  const totalFollowers = 1250; // Mock value for subscribers
  const totalPosts = 42; // Mock value for content

  return {
    performance: {
      views: {
        total: analytics?.totalViews || 0,
        thisMonth: monthlyViews,
        trend: (activityChart || []).map(v => ({ date: v.date, count: v.views || 0 })),
      },
      likes: {
        total: analytics?.totalLikes || 0,
        thisMonth: Math.floor((analytics?.totalLikes || 0) * 0.15),
        trend: (activityChart || []).map(v => ({ date: v.date, count: Math.floor((v.views || 0) * 0.1) })),
      },
      comments: {
        total: analytics?.totalComments || 0,
        thisMonth: Math.floor((analytics?.totalComments || 0) * 0.15),
        trend: (activityChart || []).map(v => ({ date: v.date, count: Math.floor((v.views || 0) * 0.05) })),
      },
      shares: {
        total: analytics?.totalShares || 0,
        thisMonth: Math.floor((analytics?.totalShares || 0) * 0.15),
        trend: (activityChart || []).map(v => ({ date: v.date, count: Math.floor((v.views || 0) * 0.02) })),
      },
      engagementRate: analytics?.averageEngagement || 0,
    },
    audience: {
      totalFollowers: totalFollowers,
      newFollowersThisMonth: Math.floor(totalFollowers * 0.15),
      demographics: {
        age: demographics?.averageAge ? [
          { range: '18-24', count: Math.floor(totalFollowers * 0.15) },
          { range: '25-34', count: Math.floor(totalFollowers * 0.35) },
          { range: '35-44', count: Math.floor(totalFollowers * 0.30) },
          { range: '45-54', count: Math.floor(totalFollowers * 0.15) },
          { range: '55+', count: Math.floor(totalFollowers * 0.05) },
        ] : [],
        gender: demographics?.genderBreakdown ? [
          { type: 'Femmes', count: Math.floor(totalFollowers * (demographics.genderBreakdown.female / 100)) },
          { type: 'Hommes', count: Math.floor(totalFollowers * (demographics.genderBreakdown.male / 100)) },
          { type: 'Autre', count: Math.floor(totalFollowers * (demographics.genderBreakdown.other / 100)) },
        ] : [],
        location: (demographics?.geography || []).map(l => ({ country: l.country, count: Math.floor(totalFollowers * (l.percentage / 100)) })),
      },
    },
    content: {
      totalPosts: totalPosts,
      postsThisMonth: Math.floor(totalPosts * 0.1),
      averagePostsPerWeek: 2.5,
      mostEngagingType: 'VIDEO',
    },
  };
}

function getMockCreatorPerformance(userId: string): CreatorPerformance {
  return {
    subscriberGrowth: 15.5,
    revenueGrowth: 22.3,
    engagementGrowth: 8.7,
    contentOutputGrowth: 12.1,
    performanceScore: 85,
    strengths: [
      'Taux d\'engagement élevé',
      'Croissance régulière des abonnés',
      'Contenu de qualité',
    ],
    weaknesses: [
      'Publication irrégulière',
      'Peu de diversification des revenus',
    ],
    recommendations: [
      'Augmenter la fréquence de publication',
      'Diversifier les sources de revenus',
      'Interagir plus avec les abonnés',
    ],
  };
}

function getMockCreatorTransactions(userId: string): CreatorTransaction[] {
  const tips = MockData.creatorTips;
  const ppvSales = MockData.creatorPPVSales;

  return [
    ...tips.map(t => ({
      id: t.id,
      type: 'TIP' as const,
      amount: t.amount,
      currency: 'EUR',
      status: 'COMPLETED' as const,
      description: t.message || 'Tip reçu',
      fanName: t.fanName,
      createdAt: t.date.toISOString(),
    })),
    ...ppvSales.map(p => ({
      id: p.id,
      type: 'PPV' as const,
      amount: p.price,
      currency: 'EUR',
      status: 'COMPLETED' as const,
      description: `Vente PPV: ${p.contentTitle}`,
      fanName: p.fanName,
      createdAt: p.date.toISOString(),
    })),
  ];
}

function getMockCreatorPayouts(userId: string): CreatorPayout[] {
  return MockData.creatorPayoutHistory.map(p => ({
    id: p.id,
    amount: p.netAmount,
    currency: 'EUR',
    status: p.status === 'completed' ? 'COMPLETED' : p.status === 'pending' ? 'PENDING' : 'FAILED',
    requestedAt: p.transferDate.toISOString(),
    processedAt: p.status === 'completed' ? p.transferDate.toISOString() : undefined,
    method: 'BANK_TRANSFER' as const,
    accountDetails: `Compte bancaire - Période: ${p.period}`,
    failureReason: p.status === 'failed' ? 'Erreur de traitement bancaire' : undefined,
  }));
}

function getMockCreatorBalance(userId: string): CreatorBalance {
  const revenue = MockData.generateCreatorRevenue(userId);

  return {
    available: revenue.currentMonthEarnings * 0.7,
    pending: revenue.currentMonthEarnings * 0.3,
    total: revenue.currentMonthEarnings,
    nextPayoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    minimumPayout: 50,
    currency: 'EUR',
    recentTransactions: MockData.creatorTips.slice(0, 10).map(t => ({
      id: t.id,
      type: 'EARNING' as const,
      amount: t.amount,
      description: t.message || 'Tip reçu',
      createdAt: t.date.toISOString(),
    })),
  };
}

function getMockCreatorMessages(userId: string): CreatorMessage[] {
  const conversations = MockData.generateCreatorConversations(userId);

  return conversations.flatMap(conv =>
    MockData.generateCreatorMessages(conv.id).map(msg => ({
      id: msg.id,
      conversationId: conv.id,
      fanId: conv.fanId,
      fanName: conv.fanName,
      fanHandle: conv.fanName.toLowerCase().replace(' ', ''),
      fanAvatar: conv.fanAvatar,
      content: msg.content,
      type: 'TEXT' as const,
      price: undefined,
      isRead: msg.read,
      createdAt: msg.timestamp.toISOString(),
      senderId: msg.from === 'creator' ? userId : conv.fanId,
    }))
  );
}

function getMockCreatorRequests(userId: string): CreatorRequest[] {
  const annonces = MockData.generateCreatorMarketplaceAnnonces(userId);

  return annonces.filter(a => a.status === 'new' || a.status === 'responded').map(a => ({
    id: a.id,
    fanId: a.fanId,
    fanName: a.fanName,
    fanHandle: a.fanName.toLowerCase().replace(' ', ''),
    title: a.title,
    description: a.description,
    offerPrice: a.budget.max,
    status: (a.status === 'in_progress' ? 'PENDING' :
             a.status === 'delivered' ? 'COMPLETED' :
             a.status === 'refused' ? 'DECLINED' : 'PENDING') as 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED',
    createdAt: a.publishedAt.toISOString(),
    updatedAt: a.publishedAt.toISOString(),
  })) as CreatorRequest[];
}

function getMockCreatorModerationHistory(userId: string): CreatorModerationHistory[] {
  const reports = MockData.generateCreatorReports(userId);

  return reports.map(r => ({
    id: r.id,
    type: 'CONTENT_REVIEW' as const,
    targetType: 'POST' as const,
    targetId: r.contentId || null,
    reason: String(r.reason),
    description: r.description,
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    createdAt: r.date.toISOString(),
    resolvedAt: r.status === 'resolved' ? r.date.toISOString() : undefined,
  })) as CreatorModerationHistory[];
}

function getMockCreatorFlags(userId: string): CreatorFlag[] {
  return [];
}

function getMockCreatorProfile(userId: string): CreatorProfile {
  const profile = MockData.generateCreatorProfile(userId);

  return {
    userId,
    displayName: profile.name,
    username: profile.username,
    bio: `Créateur de contenu passionné`,
    subscriptionPrice: 9.99,
    category: profile.categories,
    profilePicture: null,
    coverImage: null,
    socialLinks: {},
    settings: {
      accountStatus: {
        emailVerified: profile.isVerified,
        has2FA: false,
        isVerified: profile.isVerified,
        accountAccess: (profile.status === 'verified' ? 'active' : profile.status) as 'active' | 'suspended' | 'banned',
      },
      preferences: {
        notificationsEnabled: true,
        language: 'fr',
        timezone: 'Europe/Paris',
        profileVisibility: 'public' as const,
      },
      monetization: {
        basicPrice: 9.99,
        vipPrice: 19.99,
        premiumPrice: 29.99,
        platformCommission: 15,
        paymentMethod: 'bank',
        minimumWithdrawal: 50,
      },
    },
  };
}

// ============================================================================
// REACT HOOKS - DEMO MODE
// ============================================================================

export function useCreatorOverview(userId: string) {
  return createMockQuery(getMockCreatorOverview(userId), 'useCreatorOverview', userId);
}

export function useCreatorRevenue(userId: string) {
  return createMockQuery(getMockCreatorRevenue(userId), 'useCreatorRevenue', userId);
}

export function useCreatorSubscribers(userId: string, filters?: CreatorSubscribersFilters) {
  return createMockQuery(getMockCreatorSubscribers(userId, filters), 'useCreatorSubscribers', userId);
}

export function useCreatorSubscriberStats(userId: string) {
  return createMockQuery(getMockCreatorSubscriberStats(userId), 'useCreatorSubscriberStats', userId);
}

export function useCreatorContent(userId: string, filters?: CreatorPostsFilters) {
  return createMockQuery(getMockCreatorContent(userId, filters), 'useCreatorContent', userId);
}

export function useCreatorContentStats(userId: string) {
  return createMockQuery(getMockCreatorContentStats(userId), 'useCreatorContentStats', userId);
}

export function useCreatorAnalytics(userId: string) {
  return createMockQuery(getMockCreatorAnalytics(userId), 'useCreatorAnalytics', userId);
}

export function useCreatorPerformance(userId: string) {
  return createMockQuery(getMockCreatorPerformance(userId), 'useCreatorPerformance', userId);
}

export function useCreatorTransactions(userId: string) {
  return createMockQuery(getMockCreatorTransactions(userId), 'useCreatorTransactions', userId);
}

export function useCreatorPayouts(userId: string) {
  return createMockQuery(getMockCreatorPayouts(userId), 'useCreatorPayouts', userId);
}

export function useCreatorBalance(userId: string) {
  return createMockQuery(getMockCreatorBalance(userId), 'useCreatorBalance', userId);
}

export function useCreatorMessages(userId: string) {
  return createMockQuery(getMockCreatorMessages(userId), 'useCreatorMessages', userId);
}

export function useCreatorRequests(userId: string) {
  return createMockQuery(getMockCreatorRequests(userId), 'useCreatorRequests', userId);
}

export function useCreatorModerationHistory(userId: string) {
  return createMockQuery(getMockCreatorModerationHistory(userId), 'useCreatorModerationHistory', userId);
}

export function useCreatorFlags(userId: string) {
  return createMockQuery(getMockCreatorFlags(userId), 'useCreatorFlags', userId);
}

export function useCreatorProfile(userId: string) {
  return createMockQuery(getMockCreatorProfile(userId), 'useCreatorProfile', userId);
}

export function useUpdateCreatorProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, profile }: { userId: string; profile: Partial<CreatorProfile> }) => {
      console.log('🎭 [DEMO MODE] useUpdateCreatorProfile - Simulating profile update', { userId, profile });
      await simulateNetworkDelay();
      return { ...profile, userId };
    },
    onSuccess: (data, variables) => {
      console.log('✅ [DEMO MODE] Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: creatorKeys.profile(variables.userId) });
      queryClient.invalidateQueries({ queryKey: creatorKeys.overview(variables.userId) });
      adminToasts.general.saveSuccess();
    },
    onError: (error: Error) => {
      console.error('❌ [DEMO MODE] Profile update failed', error);
      adminToasts.general.saveFailed(error.message);
    },
  });
}
