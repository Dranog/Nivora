import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController, CreatorsPostsController } from './posts.controller';

@Module({
  controllers: [PostsController, CreatorsPostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
