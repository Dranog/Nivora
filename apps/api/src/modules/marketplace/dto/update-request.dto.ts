import { IsString, IsOptional, IsEnum } from 'class-validator';
import { DataRequestStatus } from '@prisma/client';

export class UpdateRequestDto {
  @IsEnum(DataRequestStatus)
  @IsOptional()
  status?: DataRequestStatus;

  @IsString()
  @IsOptional()
  response?: string;
}
