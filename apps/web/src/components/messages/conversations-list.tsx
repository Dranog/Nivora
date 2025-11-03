'use client'

import { useState } from 'react'
import { Search, Edit, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Conversation {
  id: string
  name: string
  preview: string
  time: string
  unread: boolean
  verified: boolean
}

interface ConversationsListProps {
  conversations: Conversation[]
  selectedId?: string
  onSelect?: (id: string) => void
}

export function ConversationsList({ conversations, selectedId, onSelect }: ConversationsListProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'fans' | 'unread'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.preview.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === 'unread') return matchesSearch && conv.unread
    if (activeTab === 'fans') return matchesSearch && conv.verified
    return matchesSearch
  })

  const unreadCount = conversations.filter(c => c.unread).length

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Messages</h2>
          <Button size="sm" className="h-8 w-8 p-0 rounded-full">
            <Edit className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setActiveTab('fans')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === 'fans'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Fans
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect?.(conversation.id)}
            className={`w-full p-4 flex items-start gap-3 border-b hover:bg-muted/50 transition-colors text-left ${
              selectedId === conversation.id ? 'bg-muted' : ''
            }`}
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">
                {conversation.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1">
                <span className="font-medium text-sm truncate">
                  {conversation.name}
                </span>
                {conversation.verified && (
                  <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" fill="currentColor" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {conversation.preview}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {conversation.time}
              </span>
              {conversation.unread && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </Card>
  )
}
