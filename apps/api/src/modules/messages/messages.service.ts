import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  NotImplementedException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { UnlockPpvDto } from './dto/unlock-ppv.dto';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all conversations for a user with unread count
   */
  async getConversations(userId: string) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        users_conversations_user1IdTousers: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
            creatorProfile: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
        users_conversations_user2IdTousers: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            avatar: true,
            creatorProfile: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            id: true,
            type: true,
            content: true,
            createdAt: true,
            senderId: true,
          },
        },
      },
      orderBy: {
        lastMsgAt: 'desc',
      },
    });

    // Get unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const otherUser = conv.user1Id === userId ? conv.users_conversations_user2IdTousers : conv.users_conversations_user1IdTousers;

        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: otherUser.id,
            isRead: false,
          },
        });

        return {
          id: conv.id,
          otherUser: {
            id: otherUser.id,
            handle: otherUser.username || otherUser.email.split('@')[0],
            displayName: otherUser.displayName || otherUser.creatorProfile?.username,
            avatarUrl: otherUser.avatar || otherUser.creatorProfile?.avatar,
          },
          lastMessage: conv.messages[0] || null,
          unreadCount,
        };
      }),
    );

    return conversationsWithUnread;
  }

  /**
   * Get messages for a specific conversation with cursor-based pagination
   */
  async getMessages(
    userId: string,
    otherUserId: string,
    cursor?: string,
    limit = 50,
  ) {
    // Find or create conversation
    const conversation = await this.findOrCreateConversation(
      userId,
      otherUserId,
    );

    // Build query
    const where: any = {
      conversationId: conversation.id,
    };

    if (cursor) {
      where.id = { lt: cursor }; // Get messages before cursor (older messages)
    }

    const messages = await this.prisma.message.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            email: true,
            creatorProfile: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Most recent first for pagination
      },
      take: limit + 1, // Get one extra to check if there are more
    });

    const hasMore = messages.length > limit;
    const finalMessages = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore ? finalMessages[finalMessages.length - 1].id : undefined;

    // Format messages
    const formattedMessages = finalMessages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderId: msg.senderId,
      // type removed
      content: msg.content,
      mediaUrl: msg.mediaUrl,
      priceCents: msg.priceCents,
      isRead: msg.isRead,
      createdAt: msg.createdAt.toISOString(),
      sender: {
        id: msg.user.id,
        handle: msg.user.username || msg.user.email.split('@')[0],
        displayName: msg.user.displayName || msg.user.creatorProfile?.username,
        avatarUrl: msg.user.avatar || msg.user.creatorProfile?.avatar,
      },
    }));

    return {
      messages: formattedMessages.reverse(), // Reverse to show oldest first
      nextCursor,
      hasMore,
    };
  }

  /**
   * Send a message
   */
  async sendMessage(
    senderId: string,
    receiverId: string,
    dto: SendMessageDto,
  ) {
    // Verify receiver exists
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // Validate message content
    if (!dto.content && !dto.mediaUrl) {
      throw new BadRequestException('Message must have content or media');
    }

    // Validate PPV messages
    if (dto.type === 'PPV_LOCKED') {
      if (!dto.priceCents || dto.priceCents <= 0) {
        throw new BadRequestException('PPV message must have a valid price');
      }
      // Ensure sender is a creator
      const sender = await this.prisma.user.findUnique({
        where: { id: senderId },
        select: { role: true },
      });
      if (sender?.role !== 'CREATOR') {
        throw new ForbiddenException('Only creators can send PPV messages');
      }
    }

    // Find or create conversation
    const conversation = await this.findOrCreateConversation(
      senderId,
      receiverId,
    );

    // Create message
    const message = await this.prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId: conversation.id,
        senderId,
        type: dto.type || 'TEXT',
        content: dto.content || "",
        mediaUrl: dto.mediaUrl,
        priceCents: dto.priceCents,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            email: true,
            creatorProfile: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Update conversation lastMsgAt
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMsgAt: new Date() },
    });

    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      type: message.type,
      content: message.content,
      mediaUrl: message.mediaUrl,
      priceCents: message.priceCents,
      isRead: message.isRead,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: (message as any).user.id,
        handle: (message as any).user.username || (message as any).user.email.split('@')[0],
        displayName:
          (message as any).user.displayName || (message as any).user.creatorProfile?.username,
        avatarUrl:
          (message as any).user.avatar || (message as any).user.creatorProfile?.avatar,
      },
    };
  }

  /**
   * Send a tip with system message
   */
  async sendTip(
    senderId: string,
    receiverId: string,
    amountCents: number,
    paymentMethodId: string,
  ) {
    if (amountCents <= 0) {
      throw new BadRequestException('Tip amount must be positive');
    }

    // TODO: Process payment with Stripe
    // const paymentIntent = await this.stripeService.createPaymentIntent({
    //   amount: amountCents,
    //   currency: 'eur',
    //   paymentMethodId,
    //   customerId: senderId,
    // });

    // if (paymentIntent.status !== 'succeeded') {
    //   throw new BadRequestException('Payment failed');
    // }

    // Find or create conversation
    const conversation = await this.findOrCreateConversation(
      senderId,
      receiverId,
    );

    // Create system message for tip
    const tipMessage = await this.prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId: conversation.id,
        senderId,
        type: 'TEXT',
        content: `💰 Tip envoyé de ${(amountCents / 100).toFixed(2)}€`,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            email: true,
            creatorProfile: {
              select: {
                username: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    // Update conversation
    await this.prisma.conversation.update({
      where: { id: conversation.id },
      data: { lastMsgAt: new Date() },
    });

    return {
      id: tipMessage.id,
      conversationId: tipMessage.conversationId,
      senderId: tipMessage.senderId,
      type: tipMessage.type,
      content: tipMessage.content,
      createdAt: tipMessage.createdAt.toISOString(),
      sender: {
        id: tipMessage.user.id,
        handle: tipMessage.user.username || tipMessage.user.email.split('@')[0],
        displayName:
          tipMessage.user.displayName ||
          tipMessage.user.creatorProfile?.username,
        avatarUrl:
          tipMessage.user.avatar || tipMessage.user.creatorProfile?.avatar,
      },
    };
  }

  /**
   * Mark message as read
   */
  async markAsRead(userId: string, messageId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // Verify user is part of conversation - fetch conversation separately
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: message.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new ForbiddenException('Not authorized to access this message');
    }

    // Can only mark messages you received as read
    if (message.senderId === userId) {
      return message;
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
    });
  }

  /**
   * Unlock a PPV message
   */
  async unlockPpvMessage(userId: string, messageId: string, dto: UnlockPpvDto) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            creatorProfile: {
              select: {
                stripeAccountId: true,
              },
            },
          },
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.type !== 'PPV_LOCKED') {
      throw new BadRequestException('Message is not a PPV message');
    }

    // Verify user is the receiver
    if (message.senderId === userId) {
      throw new ForbiddenException('Cannot unlock your own PPV message');
    }

    // Verify user is part of conversation - fetch conversation separately
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: message.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (conversation.user1Id !== userId && conversation.user2Id !== userId) {
      throw new ForbiddenException('Not authorized');
    }

    // TODO: Process payment with Stripe
    // const stripeAccountId = message.user.creatorProfile?.stripeAccountId;
    // if (!stripeAccountId) {
    //   throw new BadRequestException('Creator has not set up payments');
    // }
    //
    // const paymentIntent = await this.stripeService.createPaymentIntent({
    //   amount: message.ppvPrice!,
    //   currency: 'eur',
    //   paymentMethodId: dto.paymentMethodId,
    //   customerId: userId,
    //   transferData: {
    //     destination: stripeAccountId,
    //   },
    // });
    //
    // if (paymentIntent.status !== 'succeeded') {
    //   throw new BadRequestException('Payment failed');
    // }

    // For now, throw not implemented
    throw new NotImplementedException(
      'Stripe PPV integration pending. Uncomment payment code above and inject PaymentsService.',
    );

    // Unlock the message
    // const unlockedMessage = await this.prisma.message.update({
    //   where: { id: messageId },
    //   data: { type: 'PPV_UNLOCKED' },
    //   include: {
    //     sender: {
    //       select: {
    //         id: true,
    //         username: true,
    //         displayName: true,
    //         avatar: true,
    //       },
    //     },
    //   },
    // });
    //
    // return unlockedMessage;
  }

  /**
   * Find or create a conversation between two users
   */
  private async findOrCreateConversation(user1Id: string, user2Id: string) {
    // Ensure consistent ordering (smaller ID first)
    const [smallerId, largerId] =
      user1Id < user2Id ? [user1Id, user2Id] : [user2Id, user1Id];

    let conversation = await this.prisma.conversation.findUnique({
      where: {
        user1Id_user2Id: {
          user1Id: smallerId,
          user2Id: largerId,
        },
      },
    });

    let isNewConversation = false;
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          id: randomUUID(),
          user1Id: smallerId,
          user2Id: largerId,
          updatedAt: new Date(),
        },
      });
      isNewConversation = true;
    }

    // Send welcome message for new conversations
    if (isNewConversation) {
      await this.sendWelcomeMessage(conversation.id, smallerId, largerId);
    }

    return conversation;
  }

  /**
   * Send automatic welcome message for new conversations
   */
  private async sendWelcomeMessage(
    conversationId: string,
    user1Id: string,
    user2Id: string,
  ) {
    // Determine if one user is a creator to customize the message
    const users = await this.prisma.user.findMany({
      where: {
        id: {
          in: [user1Id, user2Id],
        },
      },
      select: {
        id: true,
        role: true,
        displayName: true,
        creatorProfile: {
          select: {
            username: true,
          },
        },
      },
    });

    const creator = users.find((u) => u.role === 'CREATOR');
    const creatorName =
      creator?.displayName ||
      creator?.creatorProfile?.username ||
      'le créateur';

    await this.prisma.message.create({
      data: {
        id: randomUUID(),
        conversationId,
        senderId: creator?.id || user1Id, // Welcome message from creator or first user
        type: 'TEXT',
        content: `👋 Bienvenue ! N'hésitez pas à poser vos questions à ${creatorName}.`,
      },
    });
  }
}
