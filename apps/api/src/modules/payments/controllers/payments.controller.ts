import type { Request } from 'express';
import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PaymentsService } from '../payments.service';
import { LedgerService } from '../services/ledger.service';
import { WalletService } from '../services/wallet.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { CreatePurchaseDto } from '../dto/create-purchase.dto';
import { CreateTipDto } from '../dto/create-tip.dto';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ledgerService: LedgerService,
    private readonly walletService: WalletService,
  ) {}

  @Post('subscriptions')
  async createSubscription(@Body() dto: CreateSubscriptionDto, @Req() req: Request) {
    const userId = req.user!.id;
    return await this.paymentsService.createSubscription(dto, userId);
  }

  @Post('purchases')
  async createPurchase(@Body() dto: CreatePurchaseDto, @Req() req: Request) {
    const userId = req.user!.id;
    return await this.paymentsService.createPurchase(dto, userId);
  }

  @Post('tips')
  async createTip(@Body() dto: CreateTipDto, @Req() req: Request) {
    const userId = req.user!.id;
    return await this.paymentsService.createTip(dto, userId);
  }

  @Get('wallet')
  async getWallet(@Req() req: Request) {
    const userId = req.user!.id;

    // Get wallet from WalletService
    const wallet = await this.walletService.getOrCreateWallet(userId);

    // Get calculated balance from LedgerService
    // TODO: Implement getCreatorBalance in LedgerService
    // const balance = await this.ledgerService.getCreatorBalance(userId);
    const balance = { available: 0, inReserve: 0, pending: 0 };

    // Get upcoming releases
    // TODO: Implement getUpcomingReleases in LedgerService
    // const upcomingReleases = await this.ledgerService.getUpcomingReleases(userId);
    const upcomingReleases: any[] = []; // TODO: Type this properly

    return {
      wallet,
      balance,
      upcomingReleases,
    };
  }
}
