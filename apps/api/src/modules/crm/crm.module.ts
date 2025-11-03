import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CrmController } from './crm.controller';
import { CrmService } from './crm.service';
import { EmailService } from './email.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'default-secret',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [CrmController],
  providers: [CrmService, EmailService],
  exports: [CrmService, EmailService],
})
export class CrmModule {}
