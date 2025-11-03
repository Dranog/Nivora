import type { Request } from 'express';
import { Controller, Post, Delete, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ReactionsService } from './reactions.service';
import { CreateReactionDto } from './dto/create-reaction.dto';

@Controller('reactions')
export class ReactionsController {
  constructor(private reactionsService: ReactionsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateReactionDto, @Req() req: Request) {
    return this.reactionsService.create(req.user!.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string, @Req() req: Request) {
    return this.reactionsService.delete(id, req.user!.id);
  }

  @Get('post/:postId')
  async getByPost(@Param('postId') postId: string) {
    return this.reactionsService.getByPost(postId);
  }

  @Get('post/:postId/me')
  @UseGuards(JwtAuthGuard)
  async getUserReaction(@Param('postId') postId: string, @Req() req: Request) {
    const type = await this.reactionsService.getUserReaction(req.user!.id, postId);
    return { type };
  }
}
