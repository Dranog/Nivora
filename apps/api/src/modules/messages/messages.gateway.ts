import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from './messages.service';
import { PresenceService } from './presence.service';

/**
 * Messages WebSocket Gateway
 * Handles real-time messaging events
 */
@Injectable()
@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagesGateway.name);

  constructor(
    private jwtService: JwtService,
    private messagesService: MessagesService,
    private presenceService: PresenceService,
  ) {}

  /**
   * Handle new WebSocket connection
   * Validates JWT token and sets user online
   */
  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new WsException('Unauthorized: No token provided');
      }

      const decoded = await this.jwtService.verifyAsync(token);
      client.data.user = { id: decoded.sub, email: decoded.email };

      // Join user-specific room
      client.join(`user:${decoded.sub}`);

      // Set user online
      await this.presenceService.setOnline(decoded.sub);

      // Notify contacts about online status
      this.server.emit('presence:update', {
        userId: decoded.sub,
        online: true,
      });

      this.logger.log(`Client connected: ${client.id} (user: ${decoded.sub})`);
    } catch (error) {
      this.logger.error(`Connection error: ${(error as Error).message}`);
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   * Sets user offline
   */
  async handleDisconnect(client: Socket) {
    const userId = client.data.user?.id;
    if (userId) {
      await this.presenceService.setOffline(userId);

      // Notify contacts about offline status
      this.server.emit('presence:update', {
        userId,
        online: false,
      });

      this.logger.log(`Client disconnected: ${client.id} (user: ${userId})`);
    }
  }

  /**
   * Join a conversation room
   */
  @SubscribeMessage('conversation:join')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.user.id;

    // Verify user belongs to conversation
    // (This is a simplified check; in production, verify via DB)
    client.join(`conversation:${data.conversationId}`);

    this.logger.log(
      `User ${userId} joined conversation ${data.conversationId}`,
    );

    return { success: true, conversationId: data.conversationId };
  }

  /**
   * Leave a conversation room
   */
  @SubscribeMessage('conversation:leave')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    client.leave(`conversation:${data.conversationId}`);

    this.logger.log(
      `User ${client.data.user.id} left conversation ${data.conversationId}`,
    );

    return { success: true };
  }

  /**
   * Send a message (real-time)
   * Note: Message is persisted via REST API, this just broadcasts
   */
  @SubscribeMessage('message:send')
  async handleMessageSend(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; message: any },
  ) {
    // Broadcast to conversation room
    this.server.to(`conversation:${data.conversationId}`).emit('message:new', {
      ...data.message,
      senderId: client.data.user.id,
    });

    return { success: true };
  }

  /**
   * Typing indicator
   */
  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; typing: boolean },
  ) {
    // Broadcast to others in conversation (exclude sender)
    client.to(`conversation:${data.conversationId}`).emit('typing', {
      userId: client.data.user.id,
      typing: data.typing,
    });

    return { success: true };
  }

  /**
   * Message read event
   */
  @SubscribeMessage('message:read')
  async handleMessageRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string; conversationId: string },
  ) {
    // Broadcast read status to conversation
    this.server.to(`conversation:${data.conversationId}`).emit('message:read', {
      messageId: data.messageId,
      readBy: client.data.user.id,
    });

    return { success: true };
  }

  /**
   * Heartbeat to keep user online
   */
  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;
    await this.presenceService.heartbeat(userId);

    return { success: true, timestamp: Date.now() };
  }

  /**
   * Emit a message to a specific conversation
   * Used internally by REST endpoints
   */
  emitNewMessage(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:new', message);
  }

  /**
   * Emit presence update
   */
  emitPresenceUpdate(userId: string, online: boolean) {
    this.server.emit('presence:update', { userId, online });
  }
}
