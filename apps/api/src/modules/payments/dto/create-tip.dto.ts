import { IsString, IsInt, Min, IsOptional, MaxLength, IsEnum } from 'class-validator';
import { PaymentMethod } from './create-subscription.dto';

export class CreateTipDto {
  @IsString()
  creatorId!: string;

  @IsInt()
  @Min(100) // Minimum 1€
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  message?: string;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
