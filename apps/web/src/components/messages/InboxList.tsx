'use client';

import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { messagesApi, type Conversation } from '@/lib/api/messages';
import { getSocket, onNewMessage, onPresenceUpdate, type MessagePayload, type PresencePayload } from '@/lib/realtime/messages-socket';

interface InboxListProps {
  jwt: string;
  currentUserId: string;
  onSelectConversation: (conversation: Conversation) => void;
  selectedConversationId?: string;
}

export function InboxList({
  jwt,
  currentUserId,
  onSelectConversation,
  selectedConversationId,
}: InboxListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize socket
    const socket = getSocket(jwt);

    // Load conversations
    const loadConversations = async () => {
      try {
        setIsLoading(true);
        const data = await messagesApi.getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Failed to load conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();

    // Listen for new messages to update conversations
    const handleNewMessage = (message: MessagePayload) => {
      setConversations((prev) => {
        const conversationExists = prev.find((c) => c.id === message.conversationId);

        if (conversationExists) {
          // Update existing conversation
          return prev.map((c) => {
            if (c.id === message.conversationId) {
              return {
                ...c,
                lastMessage: {
                  content: message.content,
                  type: message.type,
                  createdAt: message.createdAt,
                  senderId: message.senderId,
                },
                unreadCount:
                  message.senderId !== currentUserId
                    ? c.unreadCount + 1
                    : c.unreadCount,
              };
            }
            return c;
          }).sort((a, b) => {
            // Sort by last message time (most recent first)
            const aTime = a.lastMessage?.createdAt || '';
            const bTime = b.lastMessage?.createdAt || '';
            return bTime.localeCompare(aTime);
          });
        } else {
          // New conversation - reload all conversations
          loadConversations();
          return prev;
        }
      });
    };

    // Listen for presence updates
    const handlePresenceUpdate = (payload: PresencePayload) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.otherUser.id === payload.userId) {
            return {
              ...c,
              otherUser: {
                ...c.otherUser,
                isOnline: payload.online,
              },
            };
          }
          return c;
        })
      );
    };

    onNewMessage(handleNewMessage);
    onPresenceUpdate(handlePresenceUpdate);

    return () => {
      // Cleanup handled in useConversation
    };
  }, [jwt, currentUserId]);

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return formatDistanceToNow(date, { locale: fr, addSuffix: true });
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'Aucun message';

    const { type, content, senderId } = conversation.lastMessage;
    const isOwn = senderId === currentUserId;
    const prefix = isOwn ? 'Vous: ' : '';

    switch (type) {
      case 'TEXT':
        return `${prefix}${content}`;
      case 'IMAGE':
        return `${prefix}📷 Photo`;
      case 'VIDEO':
        return `${prefix}🎥 Vidéo`;
      case 'PPV_LOCKED':
        return `${prefix}🔒 Message PPV`;
      case 'PPV_UNLOCKED':
        return `${prefix}✅ Message PPV débloqué`;
      default:
        return `${prefix}Message`;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="p-4">
            <div className="flex gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="text-muted-foreground mb-2">Aucune conversation</div>
        <p className="text-sm text-muted-foreground">
          Vos conversations apparaîtront ici
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <Card
          key={conversation.id}
          className={cn(
            'p-4 cursor-pointer transition-colors hover:bg-accent',
            selectedConversationId === conversation.id && 'bg-accent'
          )}
          onClick={() => onSelectConversation(conversation)}
        >
          <div className="flex gap-3">
            {/* Avatar with online indicator */}
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={conversation.otherUser.avatarUrl}
                  alt={conversation.otherUser.displayName || conversation.otherUser.handle}
                />
                <AvatarFallback>
                  {(conversation.otherUser.displayName || conversation.otherUser.handle)
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.otherUser.isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-semibold text-sm truncate">
                  {conversation.otherUser.displayName || `@${conversation.otherUser.handle}`}
                </h3>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                    {formatLastMessageTime(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate">
                  {getLastMessagePreview(conversation)}
                </p>
                {conversation.unreadCount > 0 && (
                  <Badge variant="default" className="ml-2 flex-shrink-0">
                    {conversation.unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
