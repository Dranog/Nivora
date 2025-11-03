'use client'

import { Card } from '@/components/ui/card'

const mockPosts = [
  { title: 'Suggest focus', revenue: '€234', thumbnail: '🏋️' },
  { title: 'Tips I', revenue: '€156', thumbnail: '💡' },
  { title: 'PPV', revenue: '€156', thumbnail: '🎬' },
  { title: 'CPS', revenue: '€108', thumbnail: '📸' }
]

export function TopPostsTable() {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
      <div className="space-y-3">
        {mockPosts.map((post, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
              {post.thumbnail}
            </div>
            <span className="flex-1 min-w-0 font-medium truncate text-sm">{post.title}</span>
            <span className="text-right font-semibold text-primary text-sm">{post.revenue}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
