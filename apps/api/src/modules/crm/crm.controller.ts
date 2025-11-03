import type { Request } from 'express';
import { Controller, Post, Get, Body, Query, UseGuards, Req, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CrmService } from './crm.service';
import { AddFanEmailDto } from './dto/add-fan-email.dto';

@Controller('crm')
export class CrmController {
  constructor(private crmService: CrmService) {}

  @Post('fans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATOR')
  async addFanEmail(@Body() dto: AddFanEmailDto, @Req() req: Request) {
    return this.crmService.addFanEmail(req.user!.id, dto.email, dto.source || 'MANUAL');
  }

  @Get('confirm-opt-in')
  async confirmOptIn(@Query('token') token: string) {
    return this.crmService.confirmOptIn(token);
  }

  @Get('fans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATOR')
  async getFanEmails(
    @Req() req: Request,
    @Query('optIn') optIn?: string,
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
  ) {
    return this.crmService.getFanEmails(
      req.user!.id,
      { optIn: optIn === 'true' ? true : optIn === 'false' ? false : undefined },
      { limit: Number(limit), offset: Number(offset) },
    );
  }

  @Post('export')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATOR')
  async exportEmails(@Req() req: Request) {
    return this.crmService.exportEmails(req.user!.id);
  }

  @Get('unsubscribe/:id')
  async unsubscribe(@Param('id') id: string) {
    return this.crmService.unsubscribe(id);
  }

  @Post('bulk-email')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CREATOR')
  async sendBulkEmail(
    @Body() body: { subject: string; html: string },
    @Req() req: Request,
  ) {
    return this.crmService.sendBulkEmail(req.user!.id, body.subject, body.html);
  }
}
