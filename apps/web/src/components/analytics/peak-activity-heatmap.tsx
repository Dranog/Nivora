'use client'

import { Card } from '@/components/ui/card'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const mockHeatmapData = [
  [0.2, 0.3, 0.4, 0.6, 0.8, 0.9, 0.7, 0.5],
  [0.3, 0.4, 0.5, 0.7, 0.85, 0.95, 0.8, 0.6],
  [0.25, 0.35, 0.45, 0.65, 0.82, 0.92, 0.75, 0.55],
  [0.3, 0.4, 0.5, 0.7, 0.88, 0.98, 0.82, 0.62],
  [0.35, 0.45, 0.55, 0.75, 0.9, 1.0, 0.85, 0.65],
  [0.4, 0.5, 0.6, 0.8, 0.75, 0.6, 0.5, 0.7],
  [0.3, 0.4, 0.5, 0.6, 0.5, 0.4, 0.3, 0.5]
]

const getColor = (intensity: number) => {
  if (intensity > 0.8) return 'bg-[#14B8A6]'
  if (intensity > 0.6) return 'bg-[#2DD4BF]'
  if (intensity > 0.4) return 'bg-[#5EEAD4]'
  if (intensity > 0.2) return 'bg-[#99F6E4]'
  return 'bg-[#CCFBF1]'
}

export function PeakActivityHeatmap() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Peak Activity Hours</h3>
      <div className="space-y-1">
        {mockHeatmapData.map((row, dayIndex) => (
          <div key={dayIndex} className="flex items-center gap-1">
            <span className="text-xs w-8 text-muted-foreground">{days[dayIndex]}</span>
            {row.map((intensity, hourIndex) => (
              <div
                key={hourIndex}
                className={`h-5 flex-1 rounded ${getColor(intensity)}`}
                title={`${days[dayIndex]} ${hourIndex * 3}h - ${Math.round(intensity * 100)}%`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>Mon</span>
        <span>Sun</span>
      </div>
    </Card>
  )
}
