import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { MessagesService } from './messages.service';
import { PresenceService } from './presence.service';
import { SendMessageDto, UnlockPpvDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(
    private readonly messagesService: MessagesService,
    private readonly presenceService: PresenceService,
  ) {}

  /**
   * GET /messages/conversations
   * Get all conversations for the current user
   */
  @Get('conversations')
  async getConversations(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getConversations(user.sub);
  }

  /**
   * GET /messages/presence/:userId
   * Get presence status of a user
   */
  @Get('presence/:userId')
  async getPresence(@Param('userId') userId: string) {
    const online = await this.presenceService.isOnline(userId);
    return { online };
  }

  /**
   * GET /messages/:userId
   * Get all messages in a conversation with a specific user
   */
  @Get(':userId')
  async getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.messagesService.getMessages(
      user.sub,
      userId,
      cursor,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  /**
   * POST /messages/:userId
   * Send a message to a specific user
   */
  @Post(':userId')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 messages per minute
  async sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(user.sub, userId, dto);
  }

  /**
   * POST /messages/:userId/tip
   * Send a tip to a user
   */
  @Post(':userId/tip')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 tips per minute
  async sendTip(
    @CurrentUser() user: JwtPayload,
    @Param('userId') userId: string,
    @Body() body: { amountCents: number; paymentMethodId: string },
  ) {
    return this.messagesService.sendTip(
      user.sub,
      userId,
      body.amountCents,
      body.paymentMethodId,
    );
  }

  /**
   * PATCH /messages/:messageId/read
   * Mark a message as read
   */
  @Patch(':messageId/read')
  async markAsRead(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
  ) {
    return this.messagesService.markAsRead(user.sub, messageId);
  }

  /**
   * POST /messages/:messageId/unlock
   * Unlock a PPV message by paying
   */
  @Post(':messageId/unlock')
  async unlockPPV(
    @CurrentUser() user: JwtPayload,
    @Param('messageId') messageId: string,
    @Body() dto: UnlockPpvDto,
  ) {
    return this.messagesService.unlockPpvMessage(user.sub, messageId, dto);
  }
}
