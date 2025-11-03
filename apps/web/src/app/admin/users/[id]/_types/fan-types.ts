import { z } from 'zod';

// ============================================
// SCHEMAS ZOD
// ============================================

export const SubscriptionSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  creatorName: z.string(),
  creatorAvatar: z.string(),
  creatorHandle: z.string(),
  plan: z.string(),
  amount: z.number(),
  status: z.enum(['active', 'cancelled', 'expired']),
  startDate: z.date(),
  nextBilling: z.date().nullable(),
  autoRenew: z.boolean(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  date: z.date(),
  type: z.enum(['subscription', 'tip', 'ppv', 'refund']),
  description: z.string(),
  amount: z.number(),
  status: z.enum(['completed', 'pending', 'failed', 'refunded']),
  creatorName: z.string().optional(),
  invoiceUrl: z.string().optional(),
});

export const TipSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  creatorName: z.string(),
  creatorAvatar: z.string(),
  amount: z.number(),
  message: z.string().optional(),
  date: z.date(),
});

export const PPVPurchaseSchema = z.object({
  id: z.string(),
  contentId: z.string(),
  title: z.string(),
  thumbnail: z.string(),
  creatorName: z.string(),
  price: z.number(),
  purchaseDate: z.date(),
  type: z.enum(['image', 'video', 'album']),
});

export const PaymentMethodSchema = z.object({
  id: z.string(),
  type: z.enum(['card', 'paypal', 'sepa']),
  last4: z.string(),
  brand: z.string().optional(),
  expiryMonth: z.number().optional(),
  expiryYear: z.number().optional(),
  isDefault: z.boolean(),
});

export const ReportSchema = z.object({
  id: z.string(),
  date: z.date(),
  reason: z.string(),
  reportedBy: z.string(),
  reportedByAvatar: z.string(),
  content: z.string(),
  contentType: z.enum(['comment', 'message', 'profile']),
  status: z.enum(['pending', 'reviewed', 'dismissed', 'action_taken']),
  reviewedBy: z.string().optional(),
  reviewedAt: z.date().optional(),
  action: z.string().optional(),
});

export const SanctionSchema = z.object({
  id: z.string(),
  type: z.enum(['warning', 'suspension', 'ban']),
  reason: z.string(),
  appliedBy: z.string(),
  appliedAt: z.date(),
  expiresAt: z.date().optional(),
  notes: z.string().optional(),
});

export const FollowedCreatorSchema = z.object({
  id: z.string(),
  creatorId: z.string(),
  creatorName: z.string(),
  creatorAvatar: z.string(),
  creatorHandle: z.string(),
  followedAt: z.date(),
  isSubscribed: z.boolean(),
});

export const ViewHistorySchema = z.object({
  id: z.string(),
  contentId: z.string(),
  contentTitle: z.string(),
  contentThumbnail: z.string(),
  creatorName: z.string(),
  viewedAt: z.date(),
  duration: z.number(), // seconds
  progress: z.number(), // percentage
});

export const ActivityLogSchema = z.object({
  id: z.string(),
  type: z.enum(['login', 'purchase', 'subscription', 'like', 'comment', 'follow', 'report', 'view']),
  description: z.string(),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const AdminNoteSchema = z.object({
  id: z.string(),
  content: z.string(),
  createdBy: z.string(),
  createdAt: z.date(),
});

// ============================================
// TYPES
// ============================================

export type Subscription = z.infer<typeof SubscriptionSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type Tip = z.infer<typeof TipSchema>;
export type PPVPurchase = z.infer<typeof PPVPurchaseSchema>;
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type Report = z.infer<typeof ReportSchema>;
export type Sanction = z.infer<typeof SanctionSchema>;
export type FollowedCreator = z.infer<typeof FollowedCreatorSchema>;
export type ViewHistory = z.infer<typeof ViewHistorySchema>;
export type ActivityLog = z.infer<typeof ActivityLogSchema>;
export type AdminNote = z.infer<typeof AdminNoteSchema>;

export interface FanAnalytics {
  totalWatchTime: number; // minutes
  videosWatched: number;
  avgSessionDuration: number; // minutes
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  topCreatorsWatched: {
    creatorName: string;
    creatorAvatar: string;
    watchTime: number;
    viewCount: number;
  }[];
  activityChart: {
    date: string;
    views: number;
    watchTime: number;
  }[];
  connectionHistory: {
    date: Date;
    ip: string;
    device: string;
    location: string;
  }[];
}

export interface FanFinances {
  subscriptions: Subscription[];
  transactions: Transaction[];
  tips: Tip[];
  ppvPurchases: PPVPurchase[];
  paymentMethods: PaymentMethod[];
  totalSpent: number;
  monthlyAverage: number;
}

export interface FanModeration {
  reports: Report[];
  sanctions: Sanction[];
  adminNotes: AdminNote[];
  flaggedComments: {
    id: string;
    content: string;
    videoTitle: string;
    date: Date;
    reason: string;
  }[];
}

export interface FanContent {
  followedCreators: FollowedCreator[];
  activeSubscriptions: Subscription[];
  ppvLibrary: PPVPurchase[];
  favorites: {
    id: string;
    contentId: string;
    title: string;
    thumbnail: string;
    creatorName: string;
    addedAt: Date;
  }[];
  viewHistory: ViewHistory[];
}

export interface FanActivity {
  logs: ActivityLog[];
  totalPages: number;
  currentPage: number;
}
