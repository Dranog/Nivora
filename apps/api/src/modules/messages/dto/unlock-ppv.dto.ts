import { IsOptional, IsString } from 'class-validator';

export class UnlockPpvDto {
  @IsOptional()
  @IsString()
  paymentMethodId?: string;
}
