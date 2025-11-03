import { IsString, IsEnum } from 'class-validator';

export class CreateReactionDto {
  @IsString()
  postId!: string;

  @IsEnum(['LIKE', 'FIRE', 'HEART', 'STAR'])
  type!: string;
}
