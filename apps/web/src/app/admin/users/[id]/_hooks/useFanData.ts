/**
 * Fan Data Hooks - DEMO MODE
 * React Query hooks for fetching all fan-related data
 * 🎭 Uses mock data instead of real API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminToasts } from '@/lib/toasts';
import { useState, useEffect } from 'react';
import * as FanMockData from '../_data/fan-mock-data';
import * as SupervisionMockData from '../_data/fan-supervision-mock-data';

// ============================================================================
// TYPES
// ============================================================================

export interface FanOverview {
  userId: string;
  totalWatchTime: number; // minutes
  videosWatched: number;
  activeSubscriptions: number;
  totalSpent: number; // euros
  lifetimeValue: number;
  joinedDate: string;
  lastActive: string;
  subscriptions: {
    id: string;
    creatorId: string;
    creatorName: string;
    creatorHandle: string;
    creatorAvatar: string | null;
    amount: number;
    startDate: string;
    status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  }[];
  recentActivity: {
    id: string;
    type: 'subscription' | 'purchase' | 'like' | 'comment' | 'follow' | 'tip';
    label: string;
    creatorName?: string;
    amount?: number;
    createdAt: string;
  }[];
}

export interface FanSubscription {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string | null;
  amount: number; // euros per month
  startDate: string;
  renewDate: string | null;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED';
  autoRenew: boolean;
  totalPaid: number;
}

export interface FanSpending {
  totalSpent: number;
  byCategory: {
    subscriptions: number;
    ppv: number;
    tips: number;
    marketplace: number;
  };
  byMonth: {
    month: string; // YYYY-MM
    total: number;
    subscriptions: number;
    ppv: number;
    tips: number;
  }[];
  topCreators: {
    creatorId: string;
    creatorName: string;
    creatorHandle: string;
    totalSpent: number;
  }[];
}

export interface FanActivity {
  totalActions: number;
  byType: {
    likes: number;
    comments: number;
    shares: number;
    purchases: number;
    follows: number;
  };
  recent: {
    id: string;
    type: 'like' | 'comment' | 'share' | 'purchase' | 'follow' | 'subscription';
    targetType: 'POST' | 'CREATOR' | 'PRODUCT';
    targetId: string;
    targetLabel: string;
    createdAt: string;
  }[];
  engagementRate: number; // percentage
  averageSessionTime: number; // minutes
}

export interface FanAnalytics {
  watchTime: {
    total: number; // minutes
    byCategory: {
      category: string;
      minutes: number;
    }[];
    trend: {
      date: string;
      minutes: number;
    }[];
  };
  engagement: {
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    averageEngagement: number; // actions per video watched
  };
  preferences: {
    favoriteCreators: string[];
    favoriteCategories: string[];
    peakActivityHours: number[]; // hours 0-23
  };
}

export interface FanEngagement {
  likes: { total: number; thisMonth: number; trend: { date: string; count: number }[] };
  comments: { total: number; thisMonth: number; trend: { date: string; count: number }[] };
  shares: { total: number; thisMonth: number; trend: { date: string; count: number }[] };
  follows: { total: number; thisMonth: number };
  engagementScore: number; // 0-100
}

export interface FanTransaction {
  id: string;
  type: 'SUBSCRIPTION' | 'PPV' | 'TIP' | 'MARKETPLACE';
  amount: number;
  currency: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  description: string;
  creatorName?: string;
  createdAt: string;
  refundedAt?: string;
  refundReason?: string;
}

export interface FanPaymentMethod {
  id: string;
  type: 'CARD' | 'PAYPAL' | 'SEPA';
  last4?: string;
  brand?: string; // visa, mastercard, etc
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export interface FanMessage {
  id: string;
  conversationId: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  creatorAvatar: string | null;
  content: string | null;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PPV_LOCKED' | 'PPV_UNLOCKED';
  price?: number;
  isRead: boolean;
  createdAt: string;
  senderId: string; // who sent this message
}

export interface FanRequest {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorHandle: string;
  title: string;
  description: string;
  price: number;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface FanReport {
  id: string;
  targetType: 'POST' | 'CREATOR' | 'MESSAGE';
  targetId: string;
  reason: string;
  description: string | null;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface FanWarning {
  id: string;
  type: 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'POLICY_VIOLATION';
  reason: string;
  description: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface FanPreferences {
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    profileVisible: boolean;
    activityVisible: boolean;
    showInSearch: boolean;
  };
  content: {
    showNSFW: boolean;
    autoplay: boolean;
    quality: 'AUTO' | 'LOW' | 'MEDIUM' | 'HIGH';
  };
  language: string;
  timezone: string;
}

// Filters
export interface FanMessagesFilters {
  creatorId?: string;
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'PPV_LOCKED' | 'PPV_UNLOCKED';
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

// ============================================================================
// QUERY KEYS
// ============================================================================

export const fanKeys = {
  all: (userId: string) => ['admin', 'users', userId, 'fan'] as const,
  overview: (userId: string) => [...fanKeys.all(userId), 'overview'] as const,
  subscriptions: (userId: string) => [...fanKeys.all(userId), 'subscriptions'] as const,
  spending: (userId: string) => [...fanKeys.all(userId), 'spending'] as const,
  activity: (userId: string) => [...fanKeys.all(userId), 'activity'] as const,
  analytics: (userId: string) => [...fanKeys.all(userId), 'analytics'] as const,
  engagement: (userId: string) => [...fanKeys.all(userId), 'engagement'] as const,
  transactions: (userId: string) => [...fanKeys.all(userId), 'transactions'] as const,
  paymentMethods: (userId: string) => [...fanKeys.all(userId), 'payment-methods'] as const,
  messages: (userId: string, filters?: FanMessagesFilters) =>
    [...fanKeys.all(userId), 'messages', filters || {}] as const,
  requests: (userId: string) => [...fanKeys.all(userId), 'requests'] as const,
  reports: (userId: string) => [...fanKeys.all(userId), 'reports'] as const,
  warnings: (userId: string) => [...fanKeys.all(userId), 'warnings'] as const,
  preferences: (userId: string) => [...fanKeys.all(userId), 'preferences'] as const,
};

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

/**
 * Simulates network delay (300-800ms)
 */
function simulateNetworkDelay(): Promise<void> {
  const delay = 300 + Math.random() * 500;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Creates a mock query with loading state simulation
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

/**
 * Generate mock fan overview
 */
function getMockFanOverview(userId: string): FanOverview {
  const finances = FanMockData.generateFanFinances(userId);
  const content = FanMockData.generateFanContent(userId);
  const analytics = FanMockData.generateFanAnalytics(userId);
  const activity = FanMockData.generateFanActivity(userId, 1);

  return {
    userId,
    totalWatchTime: analytics.totalWatchTime,
    videosWatched: analytics.videosWatched,
    activeSubscriptions: finances.subscriptions.filter(s => s.status === 'active').length,
    totalSpent: finances.totalSpent,
    lifetimeValue: finances.totalSpent,
    joinedDate: new Date('2024-02-10').toISOString(),
    lastActive: new Date().toISOString(),
    subscriptions: finances.subscriptions.map(sub => ({
      id: sub.id,
      creatorId: sub.creatorId,
      creatorName: sub.creatorName,
      creatorHandle: sub.creatorHandle,
      creatorAvatar: sub.creatorAvatar,
      amount: sub.amount,
      startDate: sub.startDate.toISOString(),
      status: sub.status.toUpperCase() as 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
    })),
    recentActivity: activity.logs.slice(0, 10).map((log, idx) => ({
      id: log.id,
      type: log.type === 'login' ? 'like' : (log.type as any),
      label: log.description,
      createdAt: log.timestamp.toISOString(),
    })),
  };
}

/**
 * Generate mock fan subscriptions
 */
function getMockFanSubscriptions(userId: string): FanSubscription[] {
  const finances = FanMockData.generateFanFinances(userId);

  return finances.subscriptions.map(sub => ({
    id: sub.id,
    creatorId: sub.creatorId,
    creatorName: sub.creatorName,
    creatorHandle: sub.creatorHandle,
    creatorAvatar: sub.creatorAvatar,
    amount: sub.amount,
    startDate: sub.startDate.toISOString(),
    renewDate: sub.nextBilling?.toISOString() || null,
    status: sub.status.toUpperCase() as 'ACTIVE' | 'CANCELLED' | 'EXPIRED',
    autoRenew: sub.autoRenew,
    totalPaid: sub.amount * 6, // Assume 6 months average
  }));
}

/**
 * Generate mock fan spending
 */
function getMockFanSpending(userId: string): FanSpending {
  const finances = FanMockData.generateFanFinances(userId);

  // Calculate spending by category
  const subscriptionsTotal = finances.subscriptions.reduce((sum, s) => sum + s.amount, 0) * 6;
  const tipsTotal = finances.tips.reduce((sum, t) => sum + t.amount, 0);
  const ppvTotal = finances.ppvPurchases.reduce((sum, p) => sum + p.price, 0);
  const marketplaceTotal = 0; // Can add if needed

  // Generate monthly spending
  const byMonth = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
    return {
      month: date.toISOString().slice(0, 7),
      total: Math.floor(Math.random() * 100) + 50,
      subscriptions: Math.floor(Math.random() * 40) + 20,
      ppv: Math.floor(Math.random() * 30) + 10,
      tips: Math.floor(Math.random() * 30) + 10,
    };
  });

  // Top creators
  const topCreators = finances.subscriptions.slice(0, 3).map((sub, idx) => ({
    creatorId: sub.creatorId,
    creatorName: sub.creatorName,
    creatorHandle: sub.creatorHandle,
    totalSpent: Math.floor(Math.random() * 200) + 100,
  }));

  return {
    totalSpent: finances.totalSpent,
    byCategory: {
      subscriptions: subscriptionsTotal,
      ppv: ppvTotal,
      tips: tipsTotal,
      marketplace: marketplaceTotal,
    },
    byMonth,
    topCreators,
  };
}

/**
 * Generate mock fan activity
 */
function getMockFanActivity(userId: string): FanActivity {
  const content = FanMockData.generateFanContent(userId);
  const analytics = FanMockData.generateFanAnalytics(userId);
  const activity = FanMockData.generateFanActivity(userId, 1);

  return {
    totalActions: analytics.totalLikes + analytics.totalComments + analytics.totalShares,
    byType: {
      likes: analytics.totalLikes,
      comments: analytics.totalComments,
      shares: analytics.totalShares,
      purchases: 25,
      follows: content.followedCreators.length,
    },
    recent: activity.logs.slice(0, 20).map(log => ({
      id: log.id,
      type: log.type === 'login' ? 'like' : (log.type as any),
      targetType: 'POST' as const,
      targetId: `post_${log.id}`,
      targetLabel: log.description,
      createdAt: log.timestamp.toISOString(),
    })),
    engagementRate: 75,
    averageSessionTime: analytics.avgSessionDuration,
  };
}

/**
 * Generate mock fan analytics
 */
function getMockFanAnalytics(userId: string): FanAnalytics {
  const analytics = FanMockData.generateFanAnalytics(userId);
  const content = FanMockData.generateFanContent(userId);

  return {
    watchTime: {
      total: analytics.totalWatchTime,
      byCategory: [
        { category: 'Fitness', minutes: 3200 },
        { category: 'Lifestyle', minutes: 2100 },
        { category: 'Gaming', minutes: 1800 },
        { category: 'Education', minutes: 1100 },
        { category: 'Other', minutes: 800 },
      ],
      trend: analytics.activityChart.map(item => ({
        date: item.date,
        minutes: item.watchTime,
      })),
    },
    engagement: {
      totalLikes: analytics.totalLikes,
      totalComments: analytics.totalComments,
      totalShares: analytics.totalShares,
      averageEngagement: (analytics.totalLikes + analytics.totalComments) / analytics.videosWatched,
    },
    preferences: {
      favoriteCreators: content.followedCreators.slice(0, 5).map(c => c.creatorName),
      favoriteCategories: ['Fitness', 'Lifestyle', 'Gaming'],
      peakActivityHours: [18, 19, 20, 21, 22],
    },
  };
}

/**
 * Generate mock fan engagement
 */
function getMockFanEngagement(userId: string): FanEngagement {
  const analytics = FanMockData.generateFanAnalytics(userId);

  // Generate trend data
  const generateTrend = (total: number) => {
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      count: Math.floor((total / 30) * (0.5 + Math.random())),
    }));
  };

  return {
    likes: {
      total: analytics.totalLikes,
      thisMonth: Math.floor(analytics.totalLikes * 0.3),
      trend: generateTrend(analytics.totalLikes),
    },
    comments: {
      total: analytics.totalComments,
      thisMonth: Math.floor(analytics.totalComments * 0.3),
      trend: generateTrend(analytics.totalComments),
    },
    shares: {
      total: analytics.totalShares,
      thisMonth: Math.floor(analytics.totalShares * 0.3),
      trend: generateTrend(analytics.totalShares),
    },
    follows: {
      total: 12,
      thisMonth: 3,
    },
    engagementScore: 78,
  };
}

/**
 * Generate mock fan transactions
 */
function getMockFanTransactions(userId: string): FanTransaction[] {
  const finances = FanMockData.generateFanFinances(userId);

  return finances.transactions.map(tx => ({
    id: tx.id,
    type: tx.type.toUpperCase() as 'SUBSCRIPTION' | 'PPV' | 'TIP' | 'MARKETPLACE',
    amount: tx.amount,
    currency: 'EUR',
    status: tx.status === 'completed' ? 'COMPLETED' : 'PENDING',
    description: tx.description,
    creatorName: tx.creatorName,
    createdAt: tx.date.toISOString(),
  }));
}

/**
 * Generate mock fan payment methods
 */
function getMockFanPaymentMethods(userId: string): FanPaymentMethod[] {
  const finances = FanMockData.generateFanFinances(userId);

  return finances.paymentMethods.map(pm => ({
    id: pm.id,
    type: pm.type.toUpperCase() as 'CARD' | 'PAYPAL' | 'SEPA',
    last4: pm.last4,
    brand: pm.brand,
    expiryMonth: pm.expiryMonth,
    expiryYear: pm.expiryYear,
    isDefault: pm.isDefault,
    createdAt: new Date('2024-01-15').toISOString(),
  }));
}

/**
 * Generate mock fan messages
 */
function getMockFanMessages(userId: string, filters?: FanMessagesFilters) {
  const messagesData = SupervisionMockData.generateMessagesData(userId);

  // Return the full MessagesData object (not flattened messages)
  return messagesData;
}

/**
 * Generate mock fan requests (marketplace)
 */
function getMockFanRequests(userId: string): FanRequest[] {
  const marketplace = SupervisionMockData.generateMarketplaceData(userId);

  return marketplace.annonces.slice(0, 10).map(annonce => ({
    id: annonce.id,
    creatorId: annonce.currentCreator?.id || 'unknown',
    creatorName: annonce.currentCreator?.name || 'N/A',
    creatorHandle: annonce.currentCreator?.handle || 'unknown',
    title: annonce.title,
    description: `Budget: €${annonce.budget.min}-${annonce.budget.max}, Deadline: ${annonce.deadline}`,
    price: annonce.budget.max,
    status: annonce.status === 'active' ? 'PENDING' :
            annonce.status === 'completed' ? 'COMPLETED' :
            annonce.status === 'rejected' ? 'DECLINED' : 'PENDING',
    createdAt: annonce.createdAt.toISOString(),
    updatedAt: annonce.createdAt.toISOString(),
  }));
}

/**
 * Generate mock fan reports
 */
function getMockFanReports(userId: string): FanReport[] {
  const moderation = FanMockData.generateFanModeration(userId);

  return moderation.reports.map(report => ({
    id: report.id,
    targetType: report.contentType === 'comment' ? 'POST' : 'CREATOR',
    targetId: `target_${report.id}`,
    reason: report.reason,
    description: report.content,
    status: report.status === 'reviewed' ? 'REVIEWED' :
            report.status === 'dismissed' ? 'DISMISSED' : 'PENDING',
    createdAt: report.date.toISOString(),
    resolvedAt: report.reviewedAt?.toISOString(),
    resolution: report.action,
  }));
}

/**
 * Generate mock fan warnings
 */
function getMockFanWarnings(userId: string): FanWarning[] {
  return [
    {
      id: 'warn_1',
      type: 'SPAM',
      reason: 'Spam dans les commentaires',
      description: 'Publication répétée de liens externes dans les commentaires',
      createdAt: new Date('2024-09-16').toISOString(),
      acknowledged: true,
    },
  ];
}

/**
 * Generate mock fan preferences
 */
function getMockFanPreferences(userId: string): FanPreferences {
  return {
    userId,
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      profileVisible: true,
      activityVisible: true,
      showInSearch: true,
    },
    content: {
      showNSFW: false,
      autoplay: true,
      quality: 'AUTO',
    },
    language: 'fr',
    timezone: 'Europe/Paris',
  };
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

/**
 * Hook: Get fan overview
 */
export function useFanOverview(userId: string) {
  return createMockQuery(getMockFanOverview(userId), 'useFanOverview', userId);
}

/**
 * Hook: Get fan subscriptions
 */
export function useFanSubscriptions(userId: string) {
  return createMockQuery(getMockFanSubscriptions(userId), 'useFanSubscriptions', userId);
}

/**
 * Hook: Get fan spending
 */
export function useFanSpending(userId: string) {
  return createMockQuery(getMockFanSpending(userId), 'useFanSpending', userId);
}

/**
 * Hook: Get fan activity
 */
export function useFanActivity(userId: string) {
  return createMockQuery(getMockFanActivity(userId), 'useFanActivity', userId);
}

/**
 * Hook: Get fan analytics
 */
export function useFanAnalytics(userId: string) {
  return createMockQuery(getMockFanAnalytics(userId), 'useFanAnalytics', userId);
}

/**
 * Hook: Get fan engagement
 */
export function useFanEngagement(userId: string) {
  return createMockQuery(getMockFanEngagement(userId), 'useFanEngagement', userId);
}

/**
 * Hook: Get fan transactions
 */
export function useFanTransactions(userId: string) {
  return createMockQuery(getMockFanTransactions(userId), 'useFanTransactions', userId);
}

/**
 * Hook: Get fan payment methods
 */
export function useFanPaymentMethods(userId: string) {
  return createMockQuery(getMockFanPaymentMethods(userId), 'useFanPaymentMethods', userId);
}

/**
 * Hook: Get fan messages with filters
 */
export function useFanMessages(userId: string, filters?: FanMessagesFilters) {
  return createMockQuery(getMockFanMessages(userId, filters), 'useFanMessages', userId);
}

/**
 * Hook: Get fan marketplace requests
 */
export function useFanRequests(userId: string) {
  return createMockQuery(getMockFanRequests(userId), 'useFanRequests', userId);
}

/**
 * Hook: Get fan reports
 */
export function useFanReports(userId: string) {
  return createMockQuery(getMockFanReports(userId), 'useFanReports', userId);
}

/**
 * Hook: Get fan warnings
 */
export function useFanWarnings(userId: string) {
  return createMockQuery(getMockFanWarnings(userId), 'useFanWarnings', userId);
}

/**
 * Hook: Get fan preferences
 */
export function useFanPreferences(userId: string) {
  return createMockQuery(getMockFanPreferences(userId), 'useFanPreferences', userId);
}

/**
 * Hook: Update fan preferences (SIMULATED)
 */
export function useUpdateFanPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, preferences }: { userId: string; preferences: Partial<FanPreferences> }) => {
      console.log('🎭 [DEMO MODE] useUpdateFanPreferences - Simulating update', { userId, preferences });
      await simulateNetworkDelay();

      // Merge with existing preferences
      const existing = getMockFanPreferences(userId);
      return { ...existing, ...preferences };
    },
    onSuccess: (data, variables) => {
      console.log('✅ [DEMO MODE] Fan preferences updated successfully');
      queryClient.invalidateQueries({ queryKey: fanKeys.preferences(variables.userId) });
      adminToasts.general.saveSuccess();
    },
    onError: (error: Error) => {
      console.error('❌ [DEMO MODE] Fan preferences update failed', error);
      adminToasts.general.saveFailed(error.message);
    },
  });
}
