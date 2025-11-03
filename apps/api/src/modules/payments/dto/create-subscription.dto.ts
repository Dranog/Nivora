import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum PaymentMethod {
  STRIPE = 'STRIPE',
  CRYPTO = 'CRYPTO',
}

export class CreateSubscriptionDto {
  @IsString()
  creatorId!: string;

  @IsOptional()
  @IsString()
  planId?: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}

export class SubscriptionResponseDto {
  subscriptionId!: string;
  status!: string;
  paymentUrl?: string;
}
