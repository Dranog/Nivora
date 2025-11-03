import { IsString } from 'class-validator';

export class PlaybackTokenDto {
  @IsString()
  mediaId!: string;
}

export class PlaybackTokenResponseDto {
  playUrl!: string;
  expiresAt!: Date;
  jti!: string;
}
