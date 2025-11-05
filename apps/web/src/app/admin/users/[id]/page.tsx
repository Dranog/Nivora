'use client';

import { lazy, Suspense, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Activity, TrendingUp, DollarSign, FileText, Users, Shield, Clock, Settings, ShoppingBag, MessageSquare } from 'lucide-react';
import { UserHeader } from './_components/user-header';
import { getDemoUserById } from '@/lib/demo/users';
import {
  getUserContentStats,
  getRecentUserContent,
  getUserSubscriptions,
} from '@/lib/demo/content';

// Data generators
import {
  generateFanAnalytics,
  generateFanFinances,
  generateFanModeration,
  generateFanContent,
  generateFanActivity,
} from './_data/fan-mock-data';

import {
  generateMarketplaceData,
  generateMessagesData,
  generateAnnonceResponses,
  generateConversationMessages,
  generateMarketplacePurchases,
  generateCreatorMarketplaceData,
} from './_data/fan-supervision-mock-data';

import {
  generateCreatorProfile,
  generateCreatorRevenue,
  generateCreatorContent,
  generateCreatorContentStats,
  generateCreatorSubscribers,
  generateCreatorSubscriberStats,
  generateCreatorConversations,
  generateCreatorMessagesStats,
  generateCreatorReports,
  generateCreatorSanctions,
  generateCreatorViolations,
  generateCreatorModerationStats,
  generateCreatorAnalytics,
  generateCreatorActivityChart,
  generateCreatorTopContent,
  generateCreatorDemographics,
  generateCreatorSettings,
  creatorTips,
  creatorPPVSales,
  creatorPayoutHistory,
} from './_data/creator-mock-data';

// ============================================================================
// LAZY LOADED TAB COMPONENTS
// ============================================================================

// Fan tabs
const FanOverviewTab = lazy(() => import('./_components/fan-overview-tab').then(m => ({ default: m.FanOverviewTab })));
const FanAnalyticsTab = lazy(() => import('./_components/fan-analytics-tab').then(m => ({ default: m.FanAnalyticsTab })));
const FanFinancesTab = lazy(() => import('./_components/fan-finances-tab').then(m => ({ default: m.FanFinancesTab })));
const FanModerationTab = lazy(() => import('./_components/fan-moderation-tab').then(m => ({ default: m.FanModerationTab })));
const FanContentTab = lazy(() => import('./_components/fan-content-tab').then(m => ({ default: m.FanContentTab })));
const FanActivityTab = lazy(() => import('./_components/fan-activity-tab').then(m => ({ default: m.FanActivityTab })));
const FanSettingsTab = lazy(() => import('./_components/fan-settings-tab').then(m => ({ default: m.FanSettingsTab })));
const FanMarketplaceTab = lazy(() => import('./_components/fan-marketplace-tab').then(m => ({ default: m.FanMarketplaceTab })));
const FanMessagesTab = lazy(() => import('./_components/fan-messages-tab').then(m => ({ default: m.FanMessagesTab })));

// Creator tabs
const CreatorOverviewTab = lazy(() => import('./_components/creator-overview-tab').then(m => ({ default: m.CreatorOverviewTab })));
const CreatorAnalyticsTab = lazy(() => import('./_components/creator-analytics-tab').then(m => ({ default: m.CreatorAnalyticsTab })));
const CreatorRevenueTab = lazy(() => import('./_components/creator-revenue-tab').then(m => ({ default: m.CreatorRevenueTab })));
const CreatorContentTab = lazy(() => import('./_components/creator-content-tab').then(m => ({ default: m.CreatorContentTab })));
const CreatorSubscribersTab = lazy(() => import('./_components/creator-subscribers-tab').then(m => ({ default: m.CreatorSubscribersTab })));
const CreatorModerationTab = lazy(() => import('./_components/creator-moderation-tab').then(m => ({ default: m.CreatorModerationTab })));
const CreatorMarketplaceTab = lazy(() => import('./_components/creator-marketplace-tab').then(m => ({ default: m.CreatorMarketplaceTab })));
const CreatorMessagesTab = lazy(() => import('./_components/creator-messages-tab').then(m => ({ default: m.CreatorMessagesTab })));
const CreatorSettingsTab = lazy(() => import('./_components/creator-settings-tab').then(m => ({ default: m.CreatorSettingsTab })));

// ============================================================================
// LOADING FALLBACK
// ============================================================================

function TabLoadingFallback() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}

// ============================================================================
// TAB DEFINITIONS
// ============================================================================

type TabType =
  | 'apercu'
  | 'analytics'
  | 'finances'
  | 'revenus'
  | 'moderation'
  | 'contenu'
  | 'contenus'
  | 'activite'
  | 'abonnes'
  | 'parametres'
  | 'marketplace'
  | 'messages';

const fanTabs = [
  { value: 'apercu' as const, icon: Activity, label: 'Aperçu' },
  { value: 'analytics' as const, icon: TrendingUp, label: 'Analytics' },
  { value: 'finances' as const, icon: DollarSign, label: 'Finances' },
  { value: 'moderation' as const, icon: Shield, label: 'Modération' },
  { value: 'contenu' as const, icon: FileText, label: 'Contenu' },
  { value: 'activite' as const, icon: Clock, label: 'Activité' },
  { value: 'parametres' as const, icon: Settings, label: 'Paramètres' },
  { value: 'marketplace' as const, icon: ShoppingBag, label: 'Marketplace' },
  { value: 'messages' as const, icon: MessageSquare, label: 'Messages' },
];

const creatorTabs = [
  { value: 'apercu' as const, icon: Activity, label: 'Aperçu' },
  { value: 'analytics' as const, icon: TrendingUp, label: 'Analytics' },
  { value: 'revenus' as const, icon: DollarSign, label: 'Revenus' },
  { value: 'contenus' as const, icon: FileText, label: 'Contenus' },
  { value: 'abonnes' as const, icon: Users, label: 'Abonnés' },
  { value: 'moderation' as const, icon: Shield, label: 'Modération' },
  { value: 'marketplace' as const, icon: ShoppingBag, label: 'Marketplace' },
  { value: 'messages' as const, icon: MessageSquare, label: 'Messages' },
  { value: 'parametres' as const, icon: Settings, label: 'Paramètres' },
];

const adminTabs = [
  { value: 'apercu' as const, icon: Activity, label: 'Aperçu' },
  { value: 'analytics' as const, icon: TrendingUp, label: 'Analytics' },
  { value: 'moderation' as const, icon: Shield, label: 'Modération' },
  { value: 'parametres' as const, icon: Settings, label: 'Paramètres' },
];

// ============================================================================
// MAIN COMPONENT (100% DEMO MODE)
// ============================================================================

export default function UserDetailPage() {
  const params = useParams();
  const userId = params.id as string;
  const [activeTab, setActiveTab] = useState<TabType>('apercu');

  // ✅ DEMO MODE: Use only demo data, no API calls
  const demoUser = getDemoUserById(userId);

  // ✅ Mock API state (no actual API calls)
  const isBanning = false;
  const isSuspending = false;

  // Determine user role from demo data
  const userRole = demoUser?.role || 'User';
  const isFan = userRole === 'User';
  const isCreator = userRole === 'Creator';
  const isAdmin = userRole === 'Admin';

  // Generate data lazily only for active tab
  const contentStats = useMemo(() => getUserContentStats(userId, userRole), [userId, userRole]);
  const recentContent = useMemo(() => getRecentUserContent(userId, userRole, 20), [userId, userRole]);
  const subscriptions = useMemo(() => getUserSubscriptions(userId), [userId]);

  // Fan data (only generate when needed)
  const fanData = useMemo(() => {
    if (!isFan) return null;
    return {
      analytics: generateFanAnalytics(userId),
      finances: generateFanFinances(userId),
      moderation: generateFanModeration(userId),
      content: generateFanContent(userId),
      activity: generateFanActivity(userId),
      marketplace: generateMarketplaceData(userId),
      messages: generateMessagesData(userId),
      marketplaceResponses: { 'A1234': generateAnnonceResponses('A1234') },
      marketplacePurchases: generateMarketplacePurchases(userId),
      conversationMessages: { 'CONV-001': generateConversationMessages('CONV-001') },
    };
  }, [isFan, userId]);

  // Creator data (only generate when needed)
  const creatorData = useMemo(() => {
    if (!isCreator) return null;
    return {
      profile: generateCreatorProfile(userId),
      revenue: generateCreatorRevenue(userId),
      content: generateCreatorContent(userId),
      contentStats: generateCreatorContentStats(),
      subscribers: generateCreatorSubscribers(userId),
      subscriberStats: generateCreatorSubscriberStats(),
      marketplace: generateCreatorMarketplaceData(userId),
      conversations: generateCreatorConversations(userId),
      messagesStats: generateCreatorMessagesStats(),
      reports: generateCreatorReports(userId),
      sanctions: generateCreatorSanctions(userId),
      violations: generateCreatorViolations(userId),
      moderationStats: generateCreatorModerationStats(),
      analytics: generateCreatorAnalytics(userId),
      activityChart: generateCreatorActivityChart(),
      topContent: generateCreatorTopContent(),
      demographics: generateCreatorDemographics(),
      settings: generateCreatorSettings(userId),
    };
  }, [isCreator, userId]);

  // If demo user doesn't exist
  if (!demoUser) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Utilisateur #{userId} introuvable dans les données DEMO.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Construct user object for header
  const userForHeader = {
    user: {
      id: demoUser.id,
      username: demoUser.handle || demoUser.name,
      displayName: demoUser.name,
      email: demoUser.email,
      avatar: demoUser.avatar,
      role: demoUser.role === 'Creator' ? 'CREATOR' : demoUser.role === 'Admin' ? 'ADMIN' : 'USER',
      verified: demoUser.emailVerified || false,
      suspended: demoUser.status === 'Suspended',
      bannedAt: demoUser.status === 'Rejected' ? new Date().toISOString() : null,
      kycStatus: demoUser.kycStatus === 'Approved' ? 'APPROVED' : demoUser.kycStatus === 'Rejected' ? 'REJECTED' : 'PENDING',
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      creatorStats: isCreator && demoUser.totalRevenue ? {
        totalRevenue: demoUser.totalRevenue,
        totalSubscribers: demoUser.subscriberCount || 0,
        totalPosts: demoUser.totalPostCount || 0,
      } : undefined,
    },
  };

  // Mock ban/suspend functions (no-op in demo mode)
  const mockBanUser = () => {
    console.log('[DEMO MODE] Ban user action (no-op)');
  };

  const mockSuspendUser = () => {
    console.log('[DEMO MODE] Suspend user action (no-op)');
  };

  // Select tabs based on user role
  const tabs = isAdmin ? adminTabs : isFan ? fanTabs : creatorTabs;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* User Header */}
        <UserHeader
          user={userForHeader as any}
          onBan={mockBanUser as any}
          onSuspend={mockSuspendUser as any}
          isBanning={isBanning}
          isSuspending={isSuspending}
        />

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabType)} className="space-y-6">
          {/* Tabs List */}
          <TabsList className="w-full justify-start overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Fan Tabs */}
          {isFan && fanData && demoUser && (
            <>
              <TabsContent value="apercu">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanOverviewTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="analytics">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanAnalyticsTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="finances">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanFinancesTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="moderation">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanModerationTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="contenu">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanContentTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="activite">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanActivityTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="parametres">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanSettingsTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="marketplace">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanMarketplaceTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="messages">
                <Suspense fallback={<TabLoadingFallback />}>
                  <FanMessagesTab userId={userId} />
                </Suspense>
              </TabsContent>
            </>
          )}

          {/* Creator Tabs */}
          {isCreator && creatorData && demoUser && (
            <>
              <TabsContent value="apercu">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorOverviewTab
                    profile={creatorData.profile as any}
                    revenue={creatorData.revenue as any}
                    recentSubscribers={creatorData.subscribers?.slice(0, 10) || []}
                    contentStats={creatorData.contentStats as any}
                    analytics={creatorData.analytics as any}
                    onTabChange={(tab: string) => setActiveTab(tab as TabType)}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="analytics">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorAnalyticsTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="revenus">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorRevenueTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="contenus">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorContentTab
                    contents={creatorData.content as any || []}
                    stats={creatorData.contentStats as any}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="abonnes">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorSubscribersTab userId={userId} />
                </Suspense>
              </TabsContent>

              <TabsContent value="moderation">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorModerationTab
                    reports={creatorData.reports as any || []}
                    sanctions={creatorData.sanctions as any || []}
                    violations={creatorData.violations as any || []}
                    stats={creatorData.moderationStats as any}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="marketplace">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorMarketplaceTab
                    data={creatorData.marketplace as any}
                    userId={userId}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="messages">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorMessagesTab
                    conversations={creatorData.conversations as any || []}
                    stats={creatorData.messagesStats as any}
                  />
                </Suspense>
              </TabsContent>

              <TabsContent value="parametres">
                <Suspense fallback={<TabLoadingFallback />}>
                  <CreatorSettingsTab userId={userId} />
                </Suspense>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  );
}
