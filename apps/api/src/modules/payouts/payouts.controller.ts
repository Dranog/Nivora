import type { Request } from 'express';
import { Controller, Get, Post, Body, UseGuards, Req, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PayoutsService } from './payouts.service';
import { RequestPayoutDto } from './dto/request-payout.dto';

@Controller('payouts')
@UseGuards(JwtAuthGuard)
export class PayoutsController {
  constructor(private readonly payoutsService: PayoutsService) {}

  @Get('me')
  async getMyPayouts(
    @Req() req: Request,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const userId = req.user!.id;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    return await this.payoutsService.getPayouts(userId, limitNum, offsetNum);
  }

  @Post('request')
  async requestPayout(@Body() dto: RequestPayoutDto, @Req() req: Request) {
    const userId = req.user!.id;
    return await this.payoutsService.requestPayout(userId, dto);
  }

  @Get('history')
  async getPayoutHistory(@Req() req: Request) {
    const userId = req.user!.id;
    return await this.payoutsService.getPayoutHistory(userId);
  }
}
