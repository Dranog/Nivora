import { Module } from '@nestjs/common';
import { BoostController } from './boost.controller';
import { BoostService } from './boost.service';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [BoostController],
  providers: [BoostService],
  exports: [BoostService],
})
export class BoostModule {}
