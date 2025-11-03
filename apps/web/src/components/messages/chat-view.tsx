'use client'

import { useState } from 'react'
import { MoreVertical, Send, ChevronDown, Play } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export type MessageType = 'text' | 'typing' | 'video' | 'system'

export interface Message {
  id: string
  text?: string
  sender?: 'me' | 'other'
  time?: string
  type: MessageType
  thumbnail?: boolean
}

interface ChatViewProps {
  messages: Message[]
  userName?: string
  isActive?: boolean
}

export function ChatView({ messages, userName = 'John Doe', isActive = true }: ChatViewProps) {
  const [messageInput, setMessageInput] = useState('')
  const [selectedPrice, setSelectedPrice] = useState('€10')

  const handleSend = () => {
    if (messageInput.trim()) {
      console.log('Sending message:', messageInput)
      setMessageInput('')
    }
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{userName}</h3>
            {isActive && (
              <p className="text-xs text-primary">Active now</p>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          // System message
          if (message.type === 'system') {
            return (
              <div key={message.id} className="flex justify-center">
                <p className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                  {message.text}
                </p>
              </div>
            )
          }

          // Typing indicator
          if (message.type === 'typing') {
            return (
              <div key={message.id} className="flex items-end gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted px-4 py-2 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )
          }

          // Video message
          if (message.type === 'video') {
            return (
              <div key={message.id} className="flex items-end gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="relative w-64 aspect-video rounded-2xl rounded-bl-sm overflow-hidden bg-gradient-to-br from-primary/30 to-primary/10 backdrop-blur-xl">
                  {/* Blurred background image simulation */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                      <Play className="h-6 w-6 text-primary ml-1" fill="currentColor" />
                    </button>
                  </div>

                  {/* Duration badge */}
                  <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-white text-xs font-medium">
                    6:23
                  </div>
                </div>
              </div>
            )
          }

          // Text messages
          const isMe = message.sender === 'me'
          return (
            <div key={message.id} className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              {!isMe && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`px-4 py-2 rounded-2xl max-w-xs ${
                  isMe
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                {message.time && (
                  <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.time}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-muted rounded-full px-4 py-2">
            <Input
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 h-auto"
            />
            <div className="relative">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="appearance-none bg-transparent border-0 text-sm font-medium pr-5 cursor-pointer focus:outline-none"
              >
                <option>€5</option>
                <option>€10</option>
                <option>€20</option>
                <option>€50</option>
              </select>
              <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none" />
            </div>
          </div>
          <Button
            onClick={handleSend}
            size="icon"
            className="rounded-full h-10 w-10 flex-shrink-0"
            disabled={!messageInput.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
