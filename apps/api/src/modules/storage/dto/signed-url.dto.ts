import { IsString, IsInt, IsEnum, IsOptional, Min, Max } from 'class-validator';

export class SignedUrlDto {
  @IsOptional()
  @IsString()
  objectKey?: string;

  @IsString()
  contentType!: string;

  @IsInt()
  @Min(1)
  @Max(500 * 1024 * 1024) // 500MB max
  contentLength!: number;

  @IsEnum(['POST', 'AVATAR', 'TEASER', 'PAID'])
  purpose!: string;
}
