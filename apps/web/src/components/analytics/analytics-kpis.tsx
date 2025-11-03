'use client'

import { Card } from '@/components/ui/card'
import { TrendingUp, Users, Activity, Eye } from 'lucide-react'

const kpis = [
  {
    label: 'Total Revenue',
    value: '€12,450',
    trend: { isPositive: true, value: '+18%' },
    description: 'vs last period',
    icon: TrendingUp
  },
  {
    label: 'Active Subscribers',
    value: '312',
    trend: { isPositive: true, value: '+24' },
    description: 'this month',
    icon: Users
  },
  {
    label: 'Engagement Rate',
    value: '8.5%',
    trend: { isPositive: false, value: '-2%' },
    description: 'vs period',
    icon: Activity
  },
  {
    label: 'Total Views',
    value: '45.1K',
    trend: { isPositive: true, value: '+1.2%' },
    description: 'today',
    icon: Eye
  }
]

export function AnalyticsKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon
        return (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{kpi.label}</span>
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold">{kpi.value}</p>
              <div className="flex items-center gap-2">
                <span 
                  className={`text-sm font-medium ${
                    kpi.trend.isPositive ? 'text-primary' : 'text-red-500'
                  }`}
                >
                  {kpi.trend.value}
                </span>
                <span className="text-sm text-muted-foreground">{kpi.description}</span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
