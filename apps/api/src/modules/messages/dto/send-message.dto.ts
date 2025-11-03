import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  ValidateIf,
} from 'class-validator';
import { MessageType } from '@prisma/client';

export class SendMessageDto {
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType = MessageType.TEXT;

  @IsString()
  @IsOptional()
  @ValidateIf((o) => !o.mediaUrl) // Required if no mediaUrl
  content?: string;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  @ValidateIf((o) => o.type === MessageType.PPV_LOCKED) // Required for PPV
  priceCents?: number;
}
