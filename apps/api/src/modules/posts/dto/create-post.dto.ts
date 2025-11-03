import {
  IsOptional,
  IsString,
  MaxLength,
  IsBoolean,
  IsInt,
  Min,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  caption?: string;

  @IsBoolean()
  isPaid!: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number; // cents

  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  mediaIds!: string[];
}
