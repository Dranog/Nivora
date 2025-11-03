import { JwtService } from '@nestjs/jwt';

// JWT expiration times in seconds
const JWT_ACCESS_EXPIRES = 900; // 15 minutes
const JWT_REFRESH_EXPIRES = 604800; // 7 days
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'default-refresh-secret';

export function generateAccessToken(
  jwtService: JwtService,
  payload: any,
): string {
  return jwtService.sign(payload, {
    secret: JWT_SECRET,
    expiresIn: JWT_ACCESS_EXPIRES,
  });
}

export function generateRefreshToken(
  jwtService: JwtService,
  payload: any,
): string {
  return jwtService.sign(payload, {
    secret: JWT_REFRESH_SECRET,
    expiresIn: JWT_REFRESH_EXPIRES,
  });
}
