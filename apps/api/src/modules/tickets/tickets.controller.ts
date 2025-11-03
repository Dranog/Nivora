import type { Request } from 'express';
import { Controller, Post, Get, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto';

@Controller('tickets')
export class TicketsController {
  constructor(private ticketsService: TicketsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateTicketDto, @Req() req: Request) {
    return this.ticketsService.create(req.user!.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getUserTickets(
    @Req() req: Request,
    @Query('status') status?: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.ticketsService.getUserTickets(
      req.user!.id,
      { status },
      { limit: Number(limit), offset: Number(offset) },
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string, @Req() req: Request) {
    return this.ticketsService.getById(id, req.user!.id, req.user!.role);
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPPORT')
  async resolve(@Param('id') id: string, @Body() dto: UpdateTicketDto, @Req() req: Request) {
    return this.ticketsService.resolve(id, req.user!.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPPORT')
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto, @Req() req: Request) {
    return this.ticketsService.update(id, req.user!.id, dto);
  }
}
