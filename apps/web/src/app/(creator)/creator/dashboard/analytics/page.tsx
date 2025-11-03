'use client'

import { PageContainer } from '@/components/layout/page-container'
import { AnalyticsKPIs } from '@/components/analytics/analytics-kpis'
import { PerformanceChart } from '@/components/analytics/performance-chart'
import { TopPostsTable } from '@/components/analytics/top-posts-table'
import { SubscriberGrowthChart } from '@/components/analytics/subscriber-growth-chart'
import { PeakActivityHeatmap } from '@/components/analytics/peak-activity-heatmap'
import { ContentPerformanceTable } from '@/components/analytics/content-performance-table'
import { QuickInsights } from '@/components/analytics/quick-insights'
import { GoalsPanel } from '@/components/analytics/goals-panel'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <PageContainer
      title="Analytics"
      description="Track your performance and growth"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Analytics' }
      ]}
      actions={
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      }
    >
      <div className="space-y-6">
        {/* 4 KPI Cards */}
        <AnalyticsKPIs />

        {/* Performance Chart */}
        <PerformanceChart />

        {/* 3 equal columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TopPostsTable />
          <SubscriberGrowthChart />
          <PeakActivityHeatmap />
        </div>

        {/* Content table (2/3) + Sidebar (1/3) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ContentPerformanceTable />
          </div>
          <div className="space-y-6">
            <QuickInsights />
            <GoalsPanel />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
