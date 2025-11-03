'use client'

const mockContent = [
  {
    title: 'Fitness videos',
    type: 'Fitness',
    views: '€34',
    purchases: '€189',
    revenue: '€156',
    engagement: 85
  },
  {
    title: 'Force dating',
    type: 'Fitness',
    views: '182',
    purchases: '€156',
    revenue: '€135',
    engagement: 72
  }
]

export function ContentPerformanceTable() {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Content Performance</h3>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Post</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Views</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Purchases</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Revenue</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Engagement %</th>
            </tr>
          </thead>
          <tbody>
            {mockContent.map((item, index) => (
              <tr key={index} className="border-b border-border last:border-0">
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10" />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-primary/10 text-primary font-medium">
                    {item.type}
                  </span>
                </td>
                <td className="py-4 px-2 text-sm">{item.views}</td>
                <td className="py-4 px-2 text-sm">{item.purchases}</td>
                <td className="py-4 px-2 font-semibold text-primary">{item.revenue}</td>
                <td className="py-4 px-2">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden max-w-[100px]">
                      <div
                        className="bg-primary h-full rounded-full transition-all"
                        style={{ width: `${item.engagement}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-10 text-right">{item.engagement}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
