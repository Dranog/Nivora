import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export interface MessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  type: string;
  content?: string;
  mediaUrl?: string;
  priceCents?: number;
  isRead: boolean;
  createdAt: string;
}

export interface TypingPayload {
  userId: string;
  typing: boolean;
}

export interface PresencePayload {
  userId: string;
  online: boolean;
}

export function getSocket(token: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001';

  socket = io(`${WS_URL}/messages`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('[Socket.io] Connected to messages namespace');
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('[Socket.io] Connection error:', error);
  });

  // Heartbeat every 30s to maintain presence
  const heartbeatInterval = setInterval(() => {
    if (socket?.connected) {
      socket.emit('heartbeat', {});
    }
  }, 30000);

  socket.on('disconnect', () => {
    clearInterval(heartbeatInterval);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Room management
export function joinConversation(conversationId: string): void {
  if (socket && socket.connected) {
    socket.emit('conversation:join', { conversationId });
  }
}

export function leaveConversation(conversationId: string): void {
  if (socket && socket.connected) {
    socket.emit('conversation:leave', { conversationId });
  }
}

// Typing indicators
export function emitTyping(conversationId: string, typing: boolean): void {
  if (socket && socket.connected) {
    socket.emit('typing', { conversationId, typing });
  }
}

export function onTyping(callback: (payload: TypingPayload) => void): void {
  if (socket) {
    socket.on('typing', callback);
  }
}

export function offTyping(): void {
  if (socket) {
    socket.off('typing');
  }
}

// Message events
export function onNewMessage(callback: (message: MessagePayload) => void): void {
  if (socket) {
    socket.on('message:new', callback);
  }
}

export function offNewMessage(): void {
  if (socket) {
    socket.off('message:new');
  }
}

// Read receipts
export function emitMessageRead(messageId: string, conversationId: string): void {
  if (socket && socket.connected) {
    socket.emit('message:read', { messageId, conversationId });
  }
}

export function onMessageRead(callback: (payload: { messageId: string; readBy: string }) => void): void {
  if (socket) {
    socket.on('message:read', callback);
  }
}

export function offMessageRead(): void {
  if (socket) {
    socket.off('message:read');
  }
}

// Presence
export function onPresenceUpdate(callback: (payload: PresencePayload) => void): void {
  if (socket) {
    socket.on('presence:update', callback);
  }
}

export function offPresenceUpdate(): void {
  if (socket) {
    socket.off('presence:update');
  }
}
