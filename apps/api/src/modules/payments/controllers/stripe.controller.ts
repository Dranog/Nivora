import { Controller, Post, Body, UseGuards, Req, BadRequestException, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();

interface CreateTipCheckoutDto {
  creatorId: string;
  amount: number;
  message?: string;
}

interface CreateUnlockCheckoutDto {
  postId: string;
}

@Controller('payments/stripe')
@UseGuards(JwtAuthGuard)
export class StripeController {
  private stripe!: Stripe;
  private frontendUrl: string;

  constructor(private readonly configService: ConfigService) {
    const stripeKey = this.configService.get('STRIPE_SECRET_KEY');
    this.frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';

    if (stripeKey) {
      // @ts-expect-error - Using Stripe API version 2024-12-18.acacia for compatibility
      this.stripe = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' });
    }
  }

  @Post('create-tip-checkout')
  async createTipCheckout(@Body() dto: CreateTipCheckoutDto, @Req() req: Request) {
    const userId = req.user!.id;

    // Validation
    if (!dto.creatorId || !dto.amount || dto.amount < 1) {
      throw new BadRequestException('Invalid tip data');
    }

    // Get creator
    const creator = await prisma.user.findUnique({
      where: { id: dto.creatorId },
      select: { displayName: true, username: true },
    });

    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const creatorName = creator.displayName || creator.username;

    // Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Tip pour ${creatorName}`,
              description: dto.message || 'Merci pour votre contenu !',
            },
            unit_amount: Math.round(dto.amount * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      success_url: `${this.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.frontendUrl}/payment/cancel`,
      metadata: {
        type: 'tip',
        userId,
        creatorId: dto.creatorId,
        amount: dto.amount.toString(),
        message: dto.message || '',
      },
    });

    return { sessionId: session.id, url: session.url };
  }

  @Post('create-unlock-checkout')
  async createUnlockCheckout(@Body() dto: CreateUnlockCheckoutDto, @Req() req: Request) {
    const userId = req.user!.id;

    if (!dto.postId) {
      throw new BadRequestException('Post ID is required');
    }

    // Get post
    const post = await prisma.post.findUnique({
      where: { id: dto.postId },
      include: { user: { select: { displayName: true, username: true } } },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if already unlocked
    const alreadyUnlocked = await prisma.unlockedPost.findFirst({
      where: { userId, postId: dto.postId },
    });

    if (alreadyUnlocked) {
      throw new BadRequestException('Post already unlocked');
    }

    // Get unlock price
    const price = post.unlockPrice || 10;
    const creatorName = post.user.displayName || post.user.username;

    // Create Stripe Checkout Session
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Déverrouiller: ${post.caption || 'Contenu exclusif'}`,
              description: `Contenu exclusif de ${creatorName}`,
            },
            unit_amount: Math.round(price * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      success_url: `${this.frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.frontendUrl}/posts/${dto.postId}`,
      metadata: {
        type: 'unlock',
        userId,
        postId: dto.postId,
        creatorId: post.creatorId,
        amount: price.toString(),
      },
    });

    return { sessionId: session.id, url: session.url };
  }
}
