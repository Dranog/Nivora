/**
 * Mock Analytics Data (F10)
 * Example data for development and testing
 */

import type {
  AdvancedAnalyticsOverview,
  RevenueMetrics,
  RetentionData,
  GeoData,
  DeviceBreakdown,
  EngagementMetrics,
} from '@/types/analytics';

// ============================================================================
// Overview Mock Data
// ============================================================================

export const mockAnalyticsOverview: AdvancedAnalyticsOverview = {
  totalRevenue: {
    label: 'Total Revenue',
    value: 50000,
    change: 12.5,
    trend: 'up',
    format: 'currency',
  },
  subscribers: {
    label: 'Subscribers',
    value: 1250,
    change: 8.3,
    trend: 'up',
    format: 'number',
  },
  arpu: {
    label: 'ARPU',
    value: 40,
    change: 3.8,
    trend: 'up',
    format: 'currency',
  },
  conversionRate: {
    label: 'Conversion Rate',
    value: 3.5,
    change: -0.5,
    trend: 'down',
    format: 'percentage',
  },
  churnRate: {
    label: 'Churn Rate',
    value: 2.1,
    change: -0.3,
    trend: 'up',
    format: 'percentage',
  },
  newSubscribers: {
    label: 'New Subscribers',
    value: 150,
    change: 15.4,
    trend: 'up',
    format: 'number',
  },
  mrr: {
    label: 'MRR',
    value: 45000,
    change: 10.2,
    trend: 'up',
    format: 'currency',
  },
  ltv: {
    label: 'LTV',
    value: 1920,
    change: 5.1,
    trend: 'up',
    format: 'currency',
  },
};

// ============================================================================
// Revenue Metrics Mock Data
// ============================================================================

export const mockRevenueMetrics: RevenueMetrics = {
  timeSeries: [
    { date: '2024-01-01', revenue: 1200, subscriptions: 1000, oneTime: 200 },
    { date: '2024-01-02', revenue: 1350, subscriptions: 1100, oneTime: 250 },
    { date: '2024-01-03', revenue: 1180, subscriptions: 950, oneTime: 230 },
    { date: '2024-01-04', revenue: 1420, subscriptions: 1200, oneTime: 220 },
    { date: '2024-01-05', revenue: 1550, subscriptions: 1300, oneTime: 250 },
    { date: '2024-01-06', revenue: 1380, subscriptions: 1150, oneTime: 230 },
    { date: '2024-01-07', revenue: 1680, subscriptions: 1450, oneTime: 230 },
    { date: '2024-01-08', revenue: 1520, subscriptions: 1250, oneTime: 270 },
    { date: '2024-01-09', revenue: 1730, subscriptions: 1500, oneTime: 230 },
    { date: '2024-01-10', revenue: 1620, subscriptions: 1350, oneTime: 270 },
  ],
  total: 50000,
  average: 1666,
  peak: {
    date: '2024-01-09',
    amount: 1730,
  },
  breakdown: {
    subscriptions: 45000,
    oneTime: 4500,
    refunds: 500,
  },
};

// ============================================================================
// Retention Data Mock
// ============================================================================

export const mockRetentionData: RetentionData = {
  cohorts: [
    {
      cohortDate: '2024-01',
      size: 150,
      retention: [100, 85, 78, 72, 68, 65],
    },
    {
      cohortDate: '2024-02',
      size: 180,
      retention: [100, 88, 82, 75, 70],
    },
    {
      cohortDate: '2024-03',
      size: 200,
      retention: [100, 90, 84, 78],
    },
    {
      cohortDate: '2024-04',
      size: 220,
      retention: [100, 92, 86],
    },
    {
      cohortDate: '2024-05',
      size: 250,
      retention: [100, 94],
    },
    {
      cohortDate: '2024-06',
      size: 280,
      retention: [100],
    },
  ],
  averageRetention: {
    month1: 89.5,
    month3: 78.2,
    month6: 65.3,
    month12: 52.8,
  },
  churnRate: 2.1,
};

// ============================================================================
// Geographic Data Mock
// ============================================================================

export const mockGeoData: GeoData = {
  byCountry: [
    { country: 'United States', countryCode: 'US', users: 450, revenue: 18000, percentage: 36 },
    { country: 'United Kingdom', countryCode: 'GB', users: 200, revenue: 8000, percentage: 16 },
    { country: 'Canada', countryCode: 'CA', users: 150, revenue: 6000, percentage: 12 },
    { country: 'Germany', countryCode: 'DE', users: 120, revenue: 4800, percentage: 9.6 },
    { country: 'France', countryCode: 'FR', users: 100, revenue: 4000, percentage: 8 },
    { country: 'Australia', countryCode: 'AU', users: 80, revenue: 3200, percentage: 6.4 },
    { country: 'Netherlands', countryCode: 'NL', users: 60, revenue: 2400, percentage: 4.8 },
    { country: 'Spain', countryCode: 'ES', users: 40, revenue: 1600, percentage: 3.2 },
    { country: 'Italy', countryCode: 'IT', users: 30, revenue: 1200, percentage: 2.4 },
    { country: 'Brazil', countryCode: 'BR', users: 20, revenue: 800, percentage: 1.6 },
  ],
  topCountries: [
    { country: 'United States', countryCode: 'US', users: 450, revenue: 18000, percentage: 36 },
    { country: 'United Kingdom', countryCode: 'GB', users: 200, revenue: 8000, percentage: 16 },
    { country: 'Canada', countryCode: 'CA', users: 150, revenue: 6000, percentage: 12 },
    { country: 'Germany', countryCode: 'DE', users: 120, revenue: 4800, percentage: 9.6 },
    { country: 'France', countryCode: 'FR', users: 100, revenue: 4000, percentage: 8 },
  ],
  totalCountries: 45,
};

// ============================================================================
// Device Breakdown Mock
// ============================================================================

export const mockDeviceBreakdown: DeviceBreakdown = {
  byDevice: [
    { device: 'Mobile', platform: 'Mobile', users: 650, sessions: 2800, percentage: 52 },
    { device: 'Desktop', platform: 'Desktop', users: 480, sessions: 1800, percentage: 38.4 },
    { device: 'Tablet', platform: 'Tablet', users: 120, sessions: 400, percentage: 9.6 },
  ],
  byPlatform: [
    { device: 'Mobile', platform: 'iOS', users: 380, sessions: 1650, percentage: 30.4 },
    { device: 'Mobile', platform: 'Android', users: 270, sessions: 1150, percentage: 21.6 },
    { device: 'Desktop', platform: 'Windows', users: 250, sessions: 950, percentage: 20 },
    { device: 'Desktop', platform: 'macOS', users: 200, sessions: 750, percentage: 16 },
    { device: 'Tablet', platform: 'iPad', users: 100, sessions: 320, percentage: 8 },
    { device: 'Desktop', platform: 'Linux', users: 50, sessions: 180, percentage: 4 },
  ],
  byBrowser: [
    { device: '', platform: '', browser: 'Chrome', users: 550, sessions: 2200, percentage: 44 },
    { device: '', platform: '', browser: 'Safari', users: 380, sessions: 1520, percentage: 30.4 },
    { device: '', platform: '', browser: 'Firefox', users: 150, sessions: 600, percentage: 12 },
    { device: '', platform: '', browser: 'Edge', users: 120, sessions: 480, percentage: 9.6 },
    { device: '', platform: '', browser: 'Other', users: 50, sessions: 200, percentage: 4 },
  ],
  totalSessions: 5000,
};

// ============================================================================
// Engagement Metrics Mock
// ============================================================================

export const mockEngagementMetrics: EngagementMetrics = {
  avgSessionDuration: 420, // 7 minutes in seconds
  avgPageViews: 5.2,
  bounceRate: 32.5,
  activeUsers: {
    daily: 450,
    weekly: 850,
    monthly: 1250,
  },
  contentViews: {
    total: 18500,
    perUser: 14.8,
  },
};
