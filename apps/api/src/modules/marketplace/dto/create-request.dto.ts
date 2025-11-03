import { IsString, IsNotEmpty, IsInt, IsOptional, IsEnum } from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateRequestDto {
  @IsString()
  @IsOptional()
  creatorId?: string;

  @IsString()
  @IsOptional()
  listingId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsOptional()
  budget?: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;
}
