import { IsString, IsOptional } from 'class-validator';

export class CompleteUploadDto {
  @IsString()
  objectKey!: string;

  @IsString()
  checksum!: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  contentLength?: number;

  @IsOptional()
  @IsString()
  purpose?: string;
}
