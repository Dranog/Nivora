'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { useConversation } from '@/hooks/useConversation';
import { messagesApi } from '@/lib/api/messages';
import type { Conversation } from '@/lib/api/messages';

interface ChatWindowProps {
  jwt: string;
  currentUserId: string;
  otherUser: Conversation['otherUser'];
  conversationId?: string;
  onBack?: () => void;
}

export function ChatWindow({
  jwt,
  currentUserId,
  otherUser,
  conversationId,
  onBack,
}: ChatWindowProps) {
  const { messages, isTyping, isLoading, hasMore, send, loadMore, markAsRead } = useConversation({
    jwt,
    otherUserId: otherUser.id,
    conversationId,
  });

  const [isUnlocking, setIsUnlocking] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when they appear
  useEffect(() => {
    const unreadMessages = messages.filter(
      (msg) => !msg.isRead && msg.senderId !== currentUserId
    );

    unreadMessages.forEach((msg) => {
      markAsRead(msg.id);
    });
  }, [messages, currentUserId, markAsRead]);

  // Handle scroll for loading more messages
  const handleScroll = () => {
    if (!messagesContainerRef.current || !hasMore) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 100) {
      loadMore();
    }
  };

  // Handle PPV unlock
  const handleUnlock = async (messageId: string) => {
    try {
      setIsUnlocking(messageId);
      // TODO: Show payment method selection dialog
      // For now, we'll use a placeholder payment method
      const paymentMethodId = 'pm_placeholder';
      await messagesApi.unlockPpv(messageId, { paymentMethodId });
      // Message will be updated via WebSocket or we can refetch
    } catch (error) {
      console.error('Failed to unlock PPV message:', error);
      alert('Échec du déblocage. Veuillez réessayer.');
    } finally {
      setIsUnlocking(null);
    }
  };

  // Wrapper to match MessageInput's onSend type expectation
  const handleSend = async (data: any) => {
    await send(data);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          <Avatar className="w-10 h-10">
            <AvatarImage src={otherUser.avatarUrl} alt={otherUser.displayName || otherUser.handle} />
            <AvatarFallback>
              {(otherUser.displayName || otherUser.handle).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">
              {otherUser.displayName || `@${otherUser.handle}`}
            </h2>
            <div className="flex items-center gap-2">
              {otherUser.isOnline ? (
                <Badge variant="default" className="text-xs h-5">
                  En ligne
                </Badge>
              ) : (
                <span className="text-xs text-muted-foreground">Hors ligne</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more indicator */}
        {hasMore && !isLoading && (
          <div className="text-center py-2">
            <Button variant="outline" size="sm" onClick={loadMore}>
              Charger plus de messages
            </Button>
          </div>
        )}

        {/* Messages */}
        {!isLoading && messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === currentUserId}
            onUnlock={handleUnlock}
            isUnlocking={isUnlocking === message.id}
          />
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 mb-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={otherUser.avatarUrl} alt={otherUser.displayName || otherUser.handle} />
              <AvatarFallback>
                {(otherUser.displayName || otherUser.handle).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-1">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-muted-foreground mb-2">
              Aucun message pour le moment
            </div>
            <p className="text-sm text-muted-foreground">
              Envoyez un message pour démarrer la conversation
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        conversationId={conversationId}
        onSend={handleSend}
        disabled={isLoading}
      />
    </div>
  );
}
