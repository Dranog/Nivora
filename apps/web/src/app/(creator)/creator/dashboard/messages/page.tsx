'use client'

import { useState } from 'react'
import { PageContainer } from '@/components/layout/page-container'
import { ConversationsList } from '@/components/messages/conversations-list'
import { ChatView } from '@/components/messages/chat-view'
import { ConversationDetails } from '@/components/messages/conversation-details'
import type { Message } from '@/components/messages/chat-view'

const mockConversations = [
  { id: '1', name: 'John Doe', preview: 'Thanks for the content...', time: '2h ago', unread: true, verified: true },
  { id: '2', name: 'John Doe', preview: 'Replye for the content...', time: '2h ago', unread: false, verified: false },
  { id: '3', name: 'John Doe', preview: 'Thanks for the content...', time: '1h ago', unread: false, verified: true },
  { id: '4', name: 'John Doe', preview: 'Thanks for receint.', time: '1h ago', unread: false, verified: false },
  { id: '5', name: 'John Doe', preview: 'Reply for the more.', time: '8h ago', unread: false, verified: false },
  { id: '6', name: 'John Doe', preview: 'Sensd your content.', time: '2h ago', unread: false, verified: true },
  { id: '7', name: 'John Doe', preview: 'Goont sent the conv...', time: '2h ago', unread: false, verified: false },
  { id: '8', name: 'John Doe', preview: 'Muto Intereepg...', time: '1h ago', unread: false, verified: false }
]

const mockMessages: Message[] = [
  { id: '1', text: 'Thank for crien!', sender: 'me', time: '14:32', type: 'text' },
  { id: '2', text: 'John is typing...', sender: 'other', type: 'typing' },
  { id: '3', sender: 'other', type: 'video', thumbnail: true },
  { id: '4', text: 'Sarfah sent a rooto', type: 'system' },
  { id: '5', text: 'John is typing...', sender: 'other', time: '14:38', type: 'typing' }
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState('1')

  return (
    <PageContainer
      title="Messages"
      description="Chat with your fans and subscribers"
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Messages' }
      ]}
    >
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 h-[calc(100vh-200px)]">
        {/* Conversations List - 3/12 */}
        <div className="xl:col-span-3">
          <ConversationsList
            conversations={mockConversations}
            selectedId={selectedConversation}
            onSelect={setSelectedConversation}
          />
        </div>

        {/* Chat View - 6/12 */}
        <div className="xl:col-span-6">
          <ChatView
            messages={mockMessages}
            userName="John Doe"
            isActive={true}
          />
        </div>

        {/* Conversation Details - 3/12 */}
        <div className="xl:col-span-3">
          <ConversationDetails
            userName="John Doe"
            isActive={true}
            purchasesCount={12}
            totalSpent="€234"
          />
        </div>
      </div>
    </PageContainer>
  )
}
