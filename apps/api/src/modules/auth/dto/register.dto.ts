import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole as Role } from '@prisma/client';
import { IsStrongPassword } from '../validators/password-strength.validator';
import { Match } from '../validators/match.validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  @Transform(({ value }) => value?.toLowerCase().trim())
  @MaxLength(255, { message: 'Email too long' })
  email!: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password must be less than 128 characters' })
  @IsStrongPassword()
  password!: string;

  @IsString({ message: 'Password confirmation must be a string' })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @Match('password', { message: 'Passwords do not match' })
  passwordConfirm!: string;

  @IsEnum(Role, { message: 'Invalid role' })
  role!: Role;
}
