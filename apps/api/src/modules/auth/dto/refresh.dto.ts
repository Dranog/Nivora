import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class RefreshDto {
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  @Matches(/^[\w-]+\.[\w-]+\.[\w-]+$/, { message: 'Invalid JWT format' })
  @MaxLength(1000, { message: 'Token too long' })
  refreshToken!: string;
}
