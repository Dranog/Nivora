import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  // ============================================================================
  // LISTINGS ENDPOINTS
  // ============================================================================

  /**
   * GET /marketplace/listings
   * Get all active listings (public)
   */
  @Get('listings')
  findAllListings(@Query('categoryId') categoryId?: string) {
    return this.marketplaceService.findAllListings(categoryId);
  }

  /**
   * GET /marketplace/listings/:id
   * Get a specific listing (public)
   */
  @Get('listings/:id')
  findOneListing(@Param('id') id: string) {
    return this.marketplaceService.findOneListing(id);
  }

  /**
   * GET /marketplace/my-listings
   * Get creator's own listings
   */
  @Get('my-listings')
  @UseGuards(JwtAuthGuard)
  findMyListings(@CurrentUser() user: JwtPayload) {
    return this.marketplaceService.findMyListings(user.sub);
  }

  /**
   * POST /marketplace/listings
   * Create a new listing (creator only)
   */
  @Post('listings')
  @UseGuards(JwtAuthGuard)
  createListing(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateListingDto,
  ) {
    return this.marketplaceService.createListing(user.sub, dto);
  }

  /**
   * PUT /marketplace/listings/:id
   * Update a listing (creator only)
   */
  @Put('listings/:id')
  @UseGuards(JwtAuthGuard)
  updateListing(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateListingDto,
  ) {
    return this.marketplaceService.updateListing(id, user.sub, dto);
  }

  /**
   * DELETE /marketplace/listings/:id
   * Delete a listing (creator only)
   */
  @Delete('listings/:id')
  @UseGuards(JwtAuthGuard)
  deleteListing(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.marketplaceService.deleteListing(id, user.sub);
  }

  // ============================================================================
  // REQUESTS ENDPOINTS
  // ============================================================================

  /**
   * GET /marketplace/requests
   * Get all requests (fan or creator)
   */
  @Get('requests')
  @UseGuards(JwtAuthGuard)
  findAllRequests(
    @CurrentUser() user: JwtPayload,
    @Query('role') role: 'fan' | 'creator',
  ) {
    return this.marketplaceService.findAllRequests(user.sub, role);
  }

  /**
   * GET /marketplace/requests/:id
   * Get a specific request
   */
  @Get('requests/:id')
  @UseGuards(JwtAuthGuard)
  findOneRequest(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return this.marketplaceService.findOneRequest(id, user.sub);
  }

  /**
   * POST /marketplace/requests
   * Create a new request (fan)
   */
  @Post('requests')
  @UseGuards(JwtAuthGuard)
  createRequest(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRequestDto,
  ) {
    return this.marketplaceService.createRequest(user.sub, dto);
  }

  /**
   * PUT /marketplace/requests/:id
   * Update a request status (creator only)
   */
  @Put('requests/:id')
  @UseGuards(JwtAuthGuard)
  updateRequest(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateRequestDto,
  ) {
    return this.marketplaceService.updateRequest(id, user.sub, dto);
  }
}
