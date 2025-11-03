import { IsInt, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateBoostDto {
  @IsInt()
  @Min(1)
  @Max(30)
  duration: number; // Duration in days (1-30)

  @IsInt()
  @Min(100)
  amount: number; // Amount in cents

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;
}
