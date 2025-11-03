import { IsEnum, IsString, IsOptional } from 'class-validator';

export class ResolveFlagDto {
  @IsEnum(['APPROVE', 'REMOVE_CONTENT', 'BAN_USER'])
  action!: 'APPROVE' | 'REMOVE_CONTENT' | 'BAN_USER';

  @IsOptional()
  @IsString()
  notes?: string;
}
