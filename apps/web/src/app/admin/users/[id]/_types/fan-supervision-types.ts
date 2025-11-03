import { z } from 'zod';

// ============================================
// FLAG TYPES
// ============================================

export const FlagSchema = z.object({
  id: z.string(),
  type: z.enum([
    'payment_offsite',
    'contact_external',
    'url_external',
    'suspicious_frequency',
    'inappropriate_content',
    'price_manipulation',
    // Marketplace-specific flags
    'creator_no_response_order',
    'fan_threat_refund',
    'creator_demands_external_payment',
    'fan_blackmail',
  ]),
  confidence: z.number().min(0).max(100),
  keywords: z.array(z.string()),
  severity: z.enum(['critical', 'warning', 'info']),
  recommendations: z.array(z.string()),
  detectedAt: z.date(),
  status: z.enum(['pending', 'validated', 'ignored', 'escalated']),
});

export type Flag = z.infer<typeof FlagSchema>;

// ============================================
// MARKETPLACE TYPES
// ============================================

export const AnnonceSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  budget: z.object({
    min: z.number(),
    max: z.number(),
  }),
  deadline: z.string(),
  status: z.enum(['active', 'in_progress', 'completed', 'rejected', 'expired']),
  responsesCount: z.number(),
  flags: z.array(FlagSchema),
  createdAt: z.date(),
  currentCreator: z
    .object({
      id: z.string(),
      name: z.string(),
      handle: z.string(),
    })
    .optional(),
  rating: z.number().min(0).max(5).optional(),
});

export type Annonce = z.infer<typeof AnnonceSchema>;

export const AnnonceResponseSchema = z.object({
  id: z.string(),
  annonceId: z.string(),
  creatorId: z.string(),
  creatorName: z.string(),
  creatorHandle: z.string(),
  creatorAvatar: z.string(),
  creatorRating: z.number().min(0).max(5),
  price: z.number(),
  deadline: z.string(),
  message: z.string(),
  flags: z.array(FlagSchema),
  submittedAt: z.date(),
  status: z.enum(['pending', 'accepted', 'rejected']),
});

export type AnnonceResponse = z.infer<typeof AnnonceResponseSchema>;

// ============================================
// MESSAGES TYPES
// ============================================

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  from: z.enum(['fan', 'creator']),
  content: z.string(),
  timestamp: z.date(),
  read: z.boolean(),
  flags: z.array(FlagSchema),
  deleted: z.boolean().default(false),
});

export type Message = z.infer<typeof MessageSchema>;

export const ConversationSchema = z.object({
  id: z.string(),
  type: z.enum(['subscription', 'marketplace']), // NEW: Type de conversation
  creatorId: z.string(),
  creatorName: z.string(),
  creatorHandle: z.string(),
  creatorAvatar: z.string(),
  messagesCount: z.number(),
  flags: z.array(FlagSchema),
  lastMessageAt: z.date(),
  status: z.enum(['active', 'closed', 'flagged']),
  severity: z.enum(['safe', 'warning', 'critical']),
});

export type Conversation = z.infer<typeof ConversationSchema>;

// ============================================
// AGGREGATE TYPES
// ============================================

export interface MarketplaceData {
  annonces: Annonce[];
  totalAnnonces: number;
  totalResponses: number;
  ongoingTransactions: number;
  detectedIncidents: number;
  analytics: {
    completionRate: number;
    averageTransactionAmount: number;
    preferredCreators: {
      id: string;
      name: string;
      count: number;
    }[];
    favoriteCategories: {
      category: string;
      count: number;
    }[];
    suspiciousPatterns: string[];
  };
}

export interface MessagesData {
  conversations: Conversation[];
  totalConversations: number;
  totalMessages: number;
  detectedFlags: number;
  adminInterventions: number;
  recentFlags: Flag[];
  aiStats: {
    accuracy: number;
    totalDetections: number;
    validatedFlags: number;
    ignoredFlags: number;
  };
}

// ============================================
// MARKETPLACE TRANSACTION TYPES
// ============================================

export type MarketplaceTransactionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export const MarketplaceTransactionSchema = z.object({
  id: z.string(),
  annonceId: z.string(),
  annonceTitle: z.string(),
  creatorId: z.string(),
  creatorUsername: z.string(),
  amount: z.number(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled', 'refunded']),
  statusLabel: z.string(),
  date: z.string(),
  deliveryDate: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
});

export type MarketplaceTransaction = z.infer<typeof MarketplaceTransactionSchema>;

// ============================================
// FAN MARKETPLACE PURCHASE TYPES (Direct purchases)
// ============================================

export type FanMarketplacePurchaseStatus =
  | 'pending'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'refunded';

export const FanMarketplacePurchaseSchema = z.object({
  id: z.string(),
  annonceId: z.string(),
  annonceTitle: z.string(),
  creatorId: z.string(),
  creatorUsername: z.string(),
  creatorAvatar: z.string(),
  amount: z.number().positive(),
  purchaseDate: z.string(), // ISO date
  status: z.enum(['pending', 'in_progress', 'delivered', 'completed', 'disputed', 'refunded']),
  deliveryDeadline: z.string(), // ISO date
  deliveredAt: z.string().optional(), // ISO date
  rating: z.number().min(1).max(5).optional(),
  flags: z.array(z.string()).optional().default([]),
});

export type FanMarketplacePurchase = z.infer<typeof FanMarketplacePurchaseSchema>;

// ============================================
// CREATOR MARKETPLACE TYPES
// ============================================

// Creator Annonce (mes annonces publiées)
export const CreatorAnnonceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  budget: z.object({ min: z.number(), max: z.number() }),
  deadline: z.string(),
  status: z.enum(['active', 'draft', 'closed']),
  viewsCount: z.number(),
  responsesCount: z.number(),
  createdAt: z.date(),
  flags: z.array(z.string()).optional().default([]),
});

export type CreatorAnnonce = z.infer<typeof CreatorAnnonceSchema>;

// Fan Demand (demandes que j'ai reçues)
export const FanDemandSchema = z.object({
  id: z.string(),
  annonceId: z.string(),
  annonceTitle: z.string(),
  fanId: z.string(),
  fanName: z.string(),
  fanAvatar: z.string(),
  fanBudget: z.object({ min: z.number(), max: z.number() }),
  requestMessage: z.string(),
  requestedAt: z.date(),
  myResponse: z
    .object({
      id: z.string(),
      price: z.number(),
      deadline: z.string(),
      message: z.string(),
      submittedAt: z.date(),
      status: z.enum(['pending', 'accepted', 'rejected']),
    })
    .optional(),
  flags: z.array(FlagSchema).default([]),
});

export type FanDemand = z.infer<typeof FanDemandSchema>;

// Creator Order (commandes unifiées)
export const CreatorOrderSchema = z.object({
  id: z.string(),
  type: z.enum(['fan_demand', 'direct_purchase']), // 2 types
  annonceId: z.string(),
  annonceTitle: z.string(),
  fanId: z.string(),
  fanName: z.string(),
  fanAvatar: z.string(),
  amount: z.number().positive(),
  startDate: z.string(), // ISO date
  status: z.enum(['pending', 'in_progress', 'delivered', 'completed', 'disputed']),
  deliveryDeadline: z.string(), // ISO date
  deliveredAt: z.string().optional(), // ISO date
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  flags: z.array(z.string()).optional().default([]),
});

export type CreatorOrder = z.infer<typeof CreatorOrderSchema>;

// Creator Reputation
export const CreatorReputationSchema = z.object({
  averageRating: z.number().min(0).max(5),
  totalReviews: z.number(),
  completionRate: z.number().min(0).max(100), // %
  averageDeliveryTime: z.number(), // days
  satisfactionRate: z.number().min(0).max(100), // %
  recentRatings: z.array(
    z.object({
      orderId: z.string(),
      rating: z.number().min(1).max(5),
      date: z.string(), // ISO date
    })
  ),
  recentReviews: z.array(
    z.object({
      orderId: z.string(),
      fanName: z.string(),
      fanAvatar: z.string(),
      rating: z.number().min(1).max(5),
      review: z.string(),
      date: z.string(), // ISO date
    })
  ),
});

export type CreatorReputation = z.infer<typeof CreatorReputationSchema>;

// Aggregate Creator Marketplace Data
export interface CreatorMarketplaceData {
  annonces: CreatorAnnonce[];
  demands: FanDemand[];
  orders: CreatorOrder[];
  reputation: CreatorReputation;
  stats: {
    totalAnnonces: number;
    activeAnnonces: number;
    totalDemands: number;
    activeOrders: number;
    completedOrders: number;
  };
}
