import { IsString, IsInt, Min, IsEnum } from 'class-validator';
import { PaymentMethod } from './create-subscription.dto';

export class CreatePurchaseDto {
  @IsString()
  postId!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;
}
