import { useEffect, useState } from 'react';
import { getSocket, onNewMessage, offNewMessage, joinConversation, leaveConversation, onTyping, offTyping, onMessageRead, offMessageRead, type MessagePayload, type TypingPayload } from '@/lib/realtime/messages-socket';
import { messagesApi, type Message, type SendMessageDto } from '@/lib/api/messages';

export interface UseConversationOptions {
  jwt: string;
  otherUserId: string;
  conversationId?: string;
  onError?: (error: Error) => void;
}

export function useConversation({ jwt, otherUserId, conversationId }: UseConversationOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();

  // Initialize socket and load initial messages
  useEffect(() => {
    const socket = getSocket(jwt);

    // Join conversation room if we have a conversationId
    if (conversationId) {
      joinConversation(conversationId);
    }

    // Load initial messages
    const loadMessages = async () => {
      try {
        setIsLoading(true);
        const response = await messagesApi.getMessages(otherUserId);
        setMessages(response.messages.reverse()); // Reverse to show oldest first
        setHasMore(response.hasMore);
        setNextCursor(response.nextCursor);
      } catch (error) {
        console.error('Failed to load messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();

    // Listen for new messages
    const handleNewMessage = (message: MessagePayload) => {
      setMessages((prev) => [...prev, message as Message]);
    };

    // Listen for typing indicators
    const handleTyping = (payload: TypingPayload) => {
      if (payload.userId === otherUserId) {
        setIsTyping(payload.typing);
      }
    };

    // Listen for read receipts
    const handleMessageRead = ({ messageId }: { messageId: string; readBy: string }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    };

    onNewMessage(handleNewMessage);
    onTyping(handleTyping);
    onMessageRead(handleMessageRead);

    // Cleanup
    return () => {
      if (conversationId) {
        leaveConversation(conversationId);
      }
      offNewMessage();
      offTyping();
      offMessageRead();
    };
  }, [jwt, otherUserId, conversationId]);

  // Send message function
  const send = async (data: SendMessageDto) => {
    try {
      const message = await messagesApi.sendMessage(otherUserId, data);
      // Message will be added via WebSocket event
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  // Load more messages (pagination)
  const loadMore = async () => {
    if (!hasMore || !nextCursor) return;

    try {
      const response = await messagesApi.getMessages(otherUserId, nextCursor);
      setMessages((prev) => [...response.messages.reverse(), ...prev]);
      setHasMore(response.hasMore);
      setNextCursor(response.nextCursor);
    } catch (error) {
      console.error('Failed to load more messages:', error);
    }
  };

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      await messagesApi.markAsRead(messageId);
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  return {
    messages,
    isTyping,
    isLoading,
    hasMore,
    send,
    loadMore,
    markAsRead,
  };
}
