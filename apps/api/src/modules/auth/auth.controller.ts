import { Controller, Post, Body, UseGuards, Request, Ip } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

/**
 * Authentication controller
 * Handles user registration, login, token refresh, and logout
 * Implements rate limiting to prevent brute force attacks
 */
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Register a new user
   * Rate limited to 3 requests per minute to prevent spam
   */
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * Login with email and password
   * Rate limited to 5 requests per minute to prevent brute force
   * IP address is tracked for audit and lockout purposes
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  async login(@Body() dto: LoginDto, @Ip() ip: string) {
    return this.authService.login(dto, ip);
  }

  /**
   * Refresh access token using refresh token
   * Rate limited to 10 requests per minute
   * IP address is logged for security audit
   */
  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 requests per minute
  async refresh(@Body() dto: RefreshDto, @Ip() ip: string) {
    return this.authService.refresh(dto.refreshToken, ip);
  }

  /**
   * Logout user by invalidating session and blacklisting token
   * Requires authentication via JWT
   * IP address is logged for security audit
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req: any, @Ip() ip: string) {
    const jti = req.user.jti;
    const userId = req.user.id;
    return this.authService.logout(jti, userId, ip);
  }
}
