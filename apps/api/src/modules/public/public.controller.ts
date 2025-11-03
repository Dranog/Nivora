import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { PublicService } from './public.service';

@Controller('public')
@UseInterceptors(CacheInterceptor)
export class PublicController {
  constructor(private publicService: PublicService) {}

  @Get('creators/:handle')
  async getCreatorByHandle(@Param('handle') handle: string) {
    return this.publicService.getCreatorByHandle(handle);
  }

  @Get('trending')
  async getTrending(@Query('limit') limit = 20) {
    return this.publicService.getTrending(Number(limit));
  }

  @Get('explore')
  async getExplore(
    @Query('category') category?: string,
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
  ) {
    return this.publicService.getExplore(
      { category },
      { limit: Number(limit), offset: Number(offset) },
    );
  }
}
