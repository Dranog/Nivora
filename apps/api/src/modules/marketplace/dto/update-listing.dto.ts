import { IsString, IsInt, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Currency, ListingStatus } from '@prisma/client';

export class UpdateListingDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  price?: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  @IsEnum(ListingStatus)
  @IsOptional()
  status?: ListingStatus;
}
