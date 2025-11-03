import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { OwnerGuard } from '../../common/guards/owner.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole as Role } from '@prisma/client';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.CREATOR)
  async create(@Request() req: any, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.user!.id, createPostDto);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    // Try to get user from request (optional authentication)
    const userId = req.user?.id;
    return this.postsService.findOne(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async remove(@Param('id') id: string) {
    return this.postsService.delete(id);
  }
}

@Controller('creators')
export class CreatorsPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get(':creatorId/posts')
  async findByCreator(
    @Param('creatorId') authorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('isPaid') isPaid?: string,
  ) {
    const filters: any = {};
    if (isPaid !== undefined) {
      filters.isPaid = isPaid === 'true';
    }

    const pagination = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
    };

    return this.postsService.findByCreator(authorId, filters, pagination);
  }
}
