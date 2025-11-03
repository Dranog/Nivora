import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
      ].join('; '),
    );

    // HTTP Strict Transport Security (HSTS)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    // X-Frame-Options - prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // X-Content-Type-Options - prevent MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer-Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy (formerly Feature-Policy)
    res.setHeader(
      'Permissions-Policy',
      [
        'camera=()',
        'microphone=()',
        'geolocation=()',
        'interest-cohort=()',
      ].join(', '),
    );

    // X-DNS-Prefetch-Control
    res.setHeader('X-DNS-Prefetch-Control', 'off');

    // X-Download-Options
    res.setHeader('X-Download-Options', 'noopen');

    // X-Permitted-Cross-Domain-Policies
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

    next();
  }
}
