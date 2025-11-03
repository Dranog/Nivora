import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { IPWhitelistService } from '../services/ip-whitelist.service';

@Injectable()
export class IPWhitelistGuard implements CanActivate {
  constructor(private ipWhitelistService: IPWhitelistService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const ipAddress = this.getClientIP(request);

    if (!ipAddress) {
      throw new ForbiddenException('Unable to determine client IP address');
    }

    const isWhitelisted = await this.ipWhitelistService.isIPWhitelisted(ipAddress);

    if (!isWhitelisted) {
      throw new ForbiddenException(`Access denied: IP ${ipAddress} is not whitelisted`);
    }

    return true;
  }

  private getClientIP(request: any): string | null {
    return (
      request.headers['x-forwarded-for']?.split(',')[0] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      null
    );
  }
}
