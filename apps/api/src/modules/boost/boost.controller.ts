import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BoostService } from './boost.service';
import { CreateBoostDto } from './dto/create-boost.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('boost')
@UseGuards(JwtAuthGuard)
export class BoostController {
  constructor(private readonly boostService: BoostService) {}

  /**
   * POST /boost/:listingId
   * Boost a listing
   */
  @Post(':listingId')
  boostListing(
    @CurrentUser() user: JwtPayload,
    @Param('listingId') listingId: string,
    @Body() dto: CreateBoostDto,
  ) {
    return this.boostService.boostListing(user.sub, listingId, dto);
  }

  /**
   * GET /boost/my-boosts
   * Get user's boosts
   */
  @Get('my-boosts')
  getMyBoosts(@CurrentUser() user: JwtPayload) {
    return this.boostService.getMyBoosts(user.sub);
  }

  /**
   * GET /boost/listing/:listingId
   * Get active boosts for a listing
   */
  @Get('listing/:listingId')
  getListingBoosts(@Param('listingId') listingId: string) {
    return this.boostService.getListingBoosts(listingId);
  }
}
