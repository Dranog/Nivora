// apps/api/src/modules/admin/dto/dashboard.dto.ts

import { z } from 'zod';

// ==========================================
// Zod Schemas
// ==========================================

export const GetDashboardQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('day'),
  refresh: z.coerce.boolean().default(false),
});

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface DashboardMetrics {
  users: {
    total: number;
    verified: number;
    suspended: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
  };
  content: {
    totalVideos: number;
    totalPosts: number;
    pendingModeration: number;
    reportedContent: number;
  };
  financial: {
    totalRevenue: number;
    revenueThisMonth: number;
    subscriptionRevenue: number;
    ppvRevenue: number;
    tipRevenue: number;
    marketplaceRevenue: number;
    pendingPayouts: number;
  };
  reports: {
    total: number;
    pending: number;
    resolved: number;
    escalated: number;
    byPriority: {
      LOW: number;
      MEDIUM: number;
      HIGH: number;
      CRITICAL: number;
    };
  };
  kyc: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  charts: {
    userGrowth: TimeSeriesData[];
    revenueGrowth: TimeSeriesData[];
    reportsTrend: TimeSeriesData[];
  };
  recentActivity: Array<{
    id: string;
    type: 'USER_SIGNUP' | 'CONTENT_REPORT' | 'KYC_SUBMISSION' | 'TRANSACTION';
    description: string;
    timestamp: Date;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>;
  cachedAt: Date;
}

export type GetDashboardQueryDto = z.infer<typeof GetDashboardQuerySchema>;

// ==========================================
// New Dashboard Endpoints Interfaces
// ==========================================

export interface TopCreator {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
  revenue: number;
  subscribers: number;
  postsCount: number;
}

export interface EngagementMetrics {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  likesGrowth: number; // Percentage growth
  commentsGrowth: number;
  sharesGrowth: number;
}

export interface ActivityMetrics {
  activeNow: number;
  averageSessionTime: number; // In seconds
  bounceRate: number; // Percentage
}

export interface GeographyData {
  country: string;
  countryCode: string;
  revenue: number;
  percentage: number;
}

export interface ConversionFunnel {
  visitors: number;
  signups: number;
  profileCompleted: number;
  firstSubscription: number;
  activeUsers: number;
}

export interface UpcomingPayout {
  daysUntil: number;
  amount: number;
  status: 'pending' | 'released';
  estimatedDate: Date;
}
