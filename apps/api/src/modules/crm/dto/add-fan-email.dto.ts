import { IsEmail, IsString, IsOptional } from 'class-validator';

export class AddFanEmailDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  source?: string;
}
