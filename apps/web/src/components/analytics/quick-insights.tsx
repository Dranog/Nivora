'use client'

import { Clock, TrendingUp, Target } from 'lucide-react'

const insights = [
  {
    icon: Clock,
    label: 'Best posting time:',
    value: '6-6 PM',
    color: 'bg-blue-500/10 text-blue-500'
  },
  {
    icon: TrendingUp,
    label: 'Top converting content:',
    value: 'Fitness videos',
    color: 'bg-primary/10 text-primary'
  },
  {
    icon: Target,
    label: 'Recommendation:',
    value: 'Post 2# daily',
    color: 'bg-purple-500/10 text-purple-500'
  }
]

export function QuickInsights() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon
          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${insight.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-muted-foreground mb-0.5">{insight.label}</p>
                <p className="font-medium">{insight.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
