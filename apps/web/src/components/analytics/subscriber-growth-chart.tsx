'use client'

import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

const mockData = [
  { name: 'New', value: 60, color: '#14B8A6', percentage: '20%' },
  { name: 'Lost', value: 15, color: '#EF4444', percentage: '' },
  { name: 'Existing', value: 135, color: '#10B981', percentage: '' }
]

export function SubscriberGrowthChart() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Subscriber Growth</h3>

      <div className="flex items-center gap-4 mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium">
          20%
        </span>
        <div>
          <p className="text-2xl font-bold">60%</p>
          <p className="text-sm text-muted-foreground">Growth</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={mockData}>
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {mockData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-around mt-4 pt-4 border-t border-border">
        {mockData.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }}></div>
            <span className="text-sm font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
