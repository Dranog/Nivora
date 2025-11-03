import { http } from '@/lib/http';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'PPV_LOCKED' | 'PPV_UNLOCKED';
  content?: string;
  mediaUrl?: string;
  priceCents?: number;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    handle: string;
    displayName?: string;
    avatarUrl?: string;
  };
}

export interface Conversation {
  id: string;
  otherUser: {
    id: string;
    handle: string;
    displayName?: string;
    avatarUrl?: string;
    isOnline?: boolean;
  };
  lastMessage?: {
    content?: string;
    type: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export interface SendMessageDto {
  type?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'FILE' | 'PPV_LOCKED';
  content?: string;
  mediaUrl?: string;
  priceCents?: number;
}

export interface UnlockPpvDto {
  paymentMethodId: string;
}

export interface MessagesResponse {
  messages: Message[];
  nextCursor?: string;
  hasMore: boolean;
}

export const messagesApi = {
  /**
   * Get all conversations for the current user
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await http.get<Conversation[]>('/messages/conversations');
    return response;
  },

  /**
   * Get messages in a conversation with cursor-based pagination
   */
  async getMessages(userId: string, cursor?: string, limit = 50): Promise<MessagesResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const response = await http.get<MessagesResponse>(`/messages/${userId}?${params.toString()}`);
    return response;
  },

  /**
   * Send a new message
   */
  async sendMessage(userId: string, dto: SendMessageDto): Promise<Message> {
    const response = await http.post<Message>(`/messages/${userId}`, dto);
    return response;
  },

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<void> {
    await http.patch(`/messages/${messageId}/read`);
  },

  /**
   * Unlock a PPV message by paying
   */
  async unlockPpv(messageId: string, dto: UnlockPpvDto): Promise<Message> {
    const response = await http.post<Message>(`/messages/${messageId}/unlock`, dto);
    return response;
  },

  /**
   * Check if a user is currently online
   */
  async getPresence(userId: string): Promise<{ online: boolean }> {
    const response = await http.get<{ online: boolean }>(`/messages/presence/${userId}`);
    return response;
  },
};
