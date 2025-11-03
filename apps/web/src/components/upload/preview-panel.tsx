'use client'

import { Lock } from 'lucide-react'

export function PreviewPanel() {
  const previewPosts = [
    {
      id: '1',
      image: '/placeholder-mountain.jpg',
      username: 'username',
      postId: '#U234',
      time: '0623',
      price: '€5'
    },
    {
      id: '2',
      image: '/placeholder-sunset.jpg',
      username: 'username',
      postId: '#U234',
      time: '08:09',
      price: '€10'
    }
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Preview</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="w-2 h-2 rounded-full bg-muted" />
        </div>
      </div>

      <div className="space-y-3">
        {previewPosts.map((post) => (
          <div
            key={post.id}
            className="relative rounded-lg overflow-hidden bg-muted aspect-[3/4]"
          >
            {/* Mock Image Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-blue-400/20" />

            {/* Watermark Icon */}
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Lock className="w-4 h-4 text-white" />
            </div>

            {/* Unlock Badge */}
            <div className="absolute top-3 left-3 px-2 py-1 bg-primary text-white text-xs font-medium rounded">
              Unlock {post.price}
            </div>

            {/* Post Info */}
            <div className="absolute bottom-3 left-3 right-3">
              <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                <p className="text-white text-xs">
                  @{post.username} • {post.postId} • {post.time}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
