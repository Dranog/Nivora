import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ModerationStatus } from '@prisma/client';

export class UpdatePostDto {
  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsEnum(ModerationStatus)
  status?: ModerationStatus;
}
