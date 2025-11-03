import { IsString, IsNotEmpty, IsInt, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateListingDto {
  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  price: number;

  @IsEnum(Currency)
  @IsOptional()
  currency?: Currency;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];
}
