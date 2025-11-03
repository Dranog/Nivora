import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RateLimitService } from '../services/rate-limit.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private rateLimitService: RateLimitService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const identifier = this.getIdentifier(request);
    const endpoint = request.path;

    const { allowed, remaining } = await this.rateLimitService.checkRateLimit(identifier, endpoint);

    // Set rate limit headers
    response.setHeader('X-RateLimit-Remaining', remaining.toString());

    if (!allowed) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Too many requests. Please try again later.',
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getIdentifier(request: any): string {
    // Use user ID if authenticated, otherwise use IP address
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    const ip =
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown';

    return `ip:${ip}`;
  }
}
