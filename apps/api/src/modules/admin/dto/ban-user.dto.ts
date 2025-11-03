import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class BanUserDto {
  @IsString()
  reason!: string;

  @IsOptional()
  @IsBoolean()
  permanent?: boolean;
}
