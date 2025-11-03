'use client'

import { ShoppingBag, DollarSign, Pin, AlertTriangle, Image as ImageIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface ConversationDetailsProps {
  userName?: string
  isActive?: boolean
  purchasesCount?: number
  totalSpent?: string
}

export function ConversationDetails({
  userName = 'John Doe',
  isActive = true,
  purchasesCount = 12,
  totalSpent = '€234'
}: ConversationDetailsProps) {
  // Mock shared media
  const sharedMedia = Array(6).fill(null).map((_, i) => ({
    id: `media-${i}`,
    type: 'image' as const
  }))

  // Mock pinned messages
  const pinnedMessages = [
    { id: '1', text: 'Send your content...', time: '2h ago' },
    { id: '2', text: 'Thanks for the...', time: '1d ago' }
  ]

  return (
    <Card className="h-full flex flex-col">
      <div className="p-6 space-y-6">
        {/* User Info */}
        <div className="flex flex-col items-center text-center">
          <Avatar className="h-16 w-16 mb-3">
            <AvatarFallback className="bg-primary/10 text-primary text-lg">
              {userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h3 className="font-semibold">{userName}</h3>
          {isActive && (
            <p className="text-xs text-primary">Active now</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">{purchasesCount}</p>
            <p className="text-xs text-muted-foreground">Purchases</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold">{totalSpent}</p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </div>

        {/* Shared Media */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold">Shared Media</h4>
            <button className="text-xs text-primary hover:underline">
              See All
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sharedMedia.map((media) => (
              <button
                key={media.id}
                className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 transition-colors flex items-center justify-center"
              >
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Messages */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Pin className="h-4 w-4 text-muted-foreground" />
            <h4 className="text-sm font-semibold">Pinned Messages</h4>
          </div>
          <div className="space-y-2">
            {pinnedMessages.map((message) => (
              <button
                key={message.id}
                className="w-full text-left p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <p className="text-sm truncate mb-1">{message.text}</p>
                <p className="text-xs text-muted-foreground">{message.time}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Report Button */}
        <Button
          variant="outline"
          className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Report User
        </Button>
      </div>
    </Card>
  )
}
