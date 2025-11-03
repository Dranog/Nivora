import { IsInt, Min, IsEnum, IsOptional, IsString } from 'class-validator';

export enum PayoutMode {
  STANDARD = 'STANDARD', // 0% fee, 7 days
  EXPRESS_CRYPTO = 'EXPRESS_CRYPTO', // 3% fee, 24h
  EXPRESS_FIAT = 'EXPRESS_FIAT', // 3% fee, 24h
}

export class RequestPayoutDto {
  @IsInt()
  @Min(5000) // Minimum 50€
  amount!: number;

  @IsEnum(PayoutMode)
  mode!: PayoutMode;

  @IsOptional()
  @IsString()
  destinationAddress?: string; // For crypto payouts

  @IsOptional()
  @IsString()
  stripeAccountId?: string; // For Stripe payouts
}
