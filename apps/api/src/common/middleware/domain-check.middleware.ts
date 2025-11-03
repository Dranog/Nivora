import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DomainCheckMiddleware implements NestMiddleware {
  constructor(private config: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const adminDomain = this.config.get<string>('ADMIN_DOMAIN');
    const nodeEnv = this.config.get<string>('NODE_ENV');

    // Bypass en développement
    if (nodeEnv === 'development') {
      return next();
    }

    const host = req.get('host') || '';

    // Bloquer si pas sur subdomain admin
    if (host !== adminDomain) {
      throw new ForbiddenException('Access denied: Invalid domain');
    }

    next();
  }
}
