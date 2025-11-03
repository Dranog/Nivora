import { z } from 'zod';

// ============================================
// CREATOR PROFILE TYPES
// ============================================

export interface CreatorProfile {
  id: string;
  email: string;
  name: string;
  username: string;
  createdAt: Date;
  categories: string[];
  status: 'active' | 'verified' | 'suspended' | 'banned';
  isVerified: boolean;
  lastPublishedAt?: Date;
}

// ============================================
// CREATOR REVENUE TYPES
// ============================================

export type RevenueSource = 'subscription' | 'tip' | 'ppv' | 'marketplace';

export interface CreatorRevenueBreakdown {
  subscriptions: number;
  tips: number;
  ppv: number;
  marketplace: number;
  total: number;
}

export interface CreatorRevenue {
  totalEarnings: number;
  currentMonthEarnings: number;
  monthlyRecurring: number;
  breakdown: CreatorRevenueBreakdown;
  subscriptionPlans: {
    basic: { price: number; count: number };
    vip: { price: number; count: number };
    premium: { price: number; count: number };
  };
}

export interface CreatorTip {
  id: string;
  fanId: string;
  fanName: string;
  fanAvatar: string;
  amount: number;
  message?: string;
  date: Date;
}

export interface CreatorPPVSale {
  id: string;
  contentId: string;
  contentTitle: string;
  fanId: string;
  fanName: string;
  fanAvatar: string;
  price: number;
  date: Date;
}

export interface CreatorPayoutHistory {
  id: string;
  period: string;
  grossAmount: number;
  platformFee: number;
  netAmount: number;
  transferDate: Date;
  status: 'pending' | 'completed' | 'failed';
}

// ============================================
// CREATOR CONTENT TYPES
// ============================================

export type ContentType = 'video' | 'photo' | 'audio' | 'text';
export type ContentStatus = 'published' | 'ppv' | 'draft' | 'archived';

export interface CreatorContent {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  thumbnail?: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt?: Date;
  isPPV: boolean;
  ppvPrice?: number;
  isFree: boolean;
}

export interface CreatorContentStats {
  totalPublished: number;
  totalPPV: number;
  totalFree: number;
  totalDrafts: number;
  totalArchived: number;
}

// ============================================
// CREATOR SUBSCRIBERS TYPES
// ============================================

export type SubscriptionPlan = 'basic' | 'vip' | 'premium';
export type SubscriptionStatus = 'active' | 'pending' | 'cancelled' | 'expired';

export interface CreatorSubscriber {
  id: string;
  fanId: string;
  fanName: string;
  fanAvatar: string;
  fanEmail: string;
  plan: SubscriptionPlan;
  pricePerMonth: number;
  subscribedSince: Date;
  lastPayment: Date;
  nextRenewal: Date;
  status: SubscriptionStatus;
  totalPaid: number;
}

export interface CreatorSubscriberStats {
  activeSubscribers: number;
  newThisMonth: number;
  unsubscribedThisMonth: number;
  retentionRate: number;
}

// ============================================
// CREATOR MARKETPLACE TYPES
// ============================================

export type MarketplaceAnnonceStatus =
  | 'new'
  | 'responded'
  | 'chosen'
  | 'in_progress'
  | 'delivered'
  | 'refused';

export interface CreatorMarketplaceAnnonce {
  id: string;
  fanId: string;
  fanName: string;
  fanAvatar: string;
  title: string;
  description: string;
  category: string;
  budget: { min: number; max: number };
  deadline: string;
  publishedAt: Date;
  status: MarketplaceAnnonceStatus;
  responsesCount: number;
  creatorHasResponded: boolean;
}

export interface CreatorMarketplaceResponse {
  id: string;
  annonceId: string;
  creatorId: string;
  message: string;
  proposedPrice: number;
  proposedDeadline: string;
  sentAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
  flags: Array<{
    id: string;
    type: string;
    confidence: number;
    severity: 'critical' | 'warning' | 'info';
  }>;
}

export interface CreatorMarketplaceOrder {
  id: string;
  annonceId: string;
  annonceTitle: string;
  fanId: string;
  fanName: string;
  fanAvatar: string;
  amount: number;
  deadline: Date;
  progress: number;
  status: 'in_progress' | 'delivered' | 'completed' | 'cancelled';
  startedAt: Date;
  deliveredAt?: Date;
  rating?: number;
  review?: string;
}

export interface CreatorMarketplaceStats {
  annoncesReceived: number;
  responsesSent: number;
  ordersInProgress: number;
  ordersCompleted: number;
  averageRating: number;
}

// ============================================
// CREATOR MODERATION TYPES
// ============================================

export type ReportReason =
  | 'inappropriate_content'
  | 'spam'
  | 'harassment'
  | 'copyright'
  | 'scam'
  | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'rejected';

export interface CreatorReport {
  id: string;
  contentId?: string;
  contentTitle?: string;
  reportedBy: string;
  reporterName: string;
  reason: ReportReason;
  description: string;
  date: Date;
  status: ReportStatus;
}

export type SanctionType = 'warning' | 'content_suspension' | 'account_suspension' | 'ban';

export interface CreatorSanction {
  id: string;
  type: SanctionType;
  reason: string;
  appliedBy: string;
  appliedByName: string;
  date: Date;
  duration?: number; // days, undefined = permanent
  expiresAt?: Date;
  status: 'active' | 'expired' | 'revoked';
}

export interface CreatorViolation {
  id: string;
  type: 'auto_detected' | 'manual_flag';
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  contentId?: string;
  status: 'pending' | 'reviewed' | 'dismissed';
}

export interface CreatorModerationStats {
  totalReports: number;
  pendingReports: number;
  contentsRemoved: number;
  activeSanctions: number;
}

// ============================================
// CREATOR MESSAGES TYPES
// ============================================

export interface CreatorConversation {
  id: string;
  type: 'subscription' | 'marketplace'; // NEW: Type de conversation
  fanId: string;
  fanName: string;
  fanAvatar: string;
  messagesCount: number;
  lastMessageAt: Date;
  lastMessagePreview: string;
  severity: 'safe' | 'warning' | 'critical';
  flagsCount: number;
}

export interface CreatorMessage {
  id: string;
  conversationId: string;
  from: 'creator' | 'fan';
  content: string;
  timestamp: Date;
  read: boolean;
  flags: Array<{
    id: string;
    type: string;
    confidence: number;
    keywords: string[];
    severity: 'critical' | 'warning' | 'info';
    recommendations: string[];
  }>;
}

export interface CreatorMessagesStats {
  activeConversations: number;
  totalMessagesSent: number;
  flagsDetected: number;
  uniqueFansContacted: number;
}

// ============================================
// CREATOR ANALYTICS TYPES
// ============================================

export interface CreatorAnalytics {
  totalViews: number;
  totalWatchTime: number; // minutes
  retentionRate: number; // percentage
  averageEngagement: number; // percentage (likes/views)
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  interactionRate: number; // percentage
}

export interface CreatorActivityChart {
  date: string;
  views: number;
  newSubscribers: number;
  revenue: number;
}

export interface CreatorTopContent {
  id: string;
  title: string;
  type: ContentType;
  views: number;
  duration?: string;
  publishedAt: Date;
}

export interface CreatorDemographics {
  geography?: Array<{ country: string; percentage: number }>;
  averageAge?: number;
  genderBreakdown?: { male: number; female: number; other: number };
}

// ============================================
// CREATOR SETTINGS TYPES
// ============================================

export interface CreatorSettings {
  accountStatus: {
    emailVerified: boolean;
    has2FA: boolean;
    isVerified: boolean;
    accountAccess: 'active' | 'suspended' | 'banned';
  };
  preferences: {
    notificationsEnabled: boolean;
    language: string;
    timezone: string;
    profileVisibility: 'public' | 'private';
  };
  monetization: {
    basicPrice: number;
    vipPrice: number;
    premiumPrice: number;
    platformCommission: number;
    paymentMethod: 'bank' | 'paypal';
    minimumWithdrawal: number;
  };
}

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

export const CreatorContentSchema = z.object({
  id: z.string(),
  title: z.string(),
  type: z.enum(['video', 'photo', 'audio', 'text']),
  status: z.enum(['published', 'ppv', 'draft', 'archived']),
  thumbnail: z.string().optional(),
  views: z.number(),
  likes: z.number(),
  comments: z.number(),
  publishedAt: z.date().optional(),
  isPPV: z.boolean(),
  ppvPrice: z.number().optional(),
  isFree: z.boolean(),
});

export const CreatorSubscriberSchema = z.object({
  id: z.string(),
  fanId: z.string(),
  fanName: z.string(),
  fanAvatar: z.string(),
  fanEmail: z.string().email(),
  plan: z.enum(['basic', 'vip', 'premium']),
  pricePerMonth: z.number(),
  subscribedSince: z.date(),
  lastPayment: z.date(),
  nextRenewal: z.date(),
  status: z.enum(['active', 'pending', 'cancelled', 'expired']),
  totalPaid: z.number(),
});

export const CreatorMarketplaceOrderSchema = z.object({
  id: z.string(),
  annonceId: z.string(),
  annonceTitle: z.string(),
  fanId: z.string(),
  fanName: z.string(),
  fanAvatar: z.string(),
  amount: z.number(),
  deadline: z.date(),
  progress: z.number().min(0).max(100),
  status: z.enum(['in_progress', 'delivered', 'completed', 'cancelled']),
  startedAt: z.date(),
  deliveredAt: z.date().optional(),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
});
