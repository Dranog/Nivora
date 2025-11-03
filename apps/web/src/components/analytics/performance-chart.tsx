'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const mockData = [
  { date: 'Sep 20', revenue: 300, subscribers: 240, traffic: 400 },
  { date: 'Sep 28', revenue: 350, subscribers: 280, traffic: 450 },
  { date: 'Aug', revenue: 380, subscribers: 300, traffic: 480 },
  { date: 'Oct 6', revenue: 420, subscribers: 350, traffic: 520 },
  { date: 'Oct 12', revenue: 488, subscribers: 400, traffic: 550 },
  { date: 'Oct 16', revenue: 450, subscribers: 420, traffic: 580 },
  { date: 'Oct 10', revenue: 480, subscribers: 450, traffic: 600 }
]

type MetricType = 'revenue' | 'subscribers' | 'traffic'

export function PerformanceChart() {
  const [activeTab, setActiveTab] = useState<MetricType>('revenue')

  const tabs = [
    { id: 'revenue' as const, label: 'Revenue' },
    { id: 'subscribers' as const, label: 'Subscribers' },
    { id: 'traffic' as const, label: 'Traffic' }
  ]

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Performance Breakdown</h3>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={mockData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
          <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Area
            type="monotone"
            dataKey={activeTab}
            stroke="#14B8A6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorMetric)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-primary"></div>
        <span className="text-sm text-muted-foreground">Oct 12 - €488</span>
      </div>
    </Card>
  )
}
