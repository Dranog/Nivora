import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown when user provides invalid login credentials
 */
export class InvalidCredentialsException extends HttpException {
  constructor(message = 'Invalid email or password') {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'InvalidCredentials',
        message,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when account is locked due to multiple failed login attempts
 */
export class AccountLockedException extends HttpException {
  constructor(lockUntil: Date) {
    const minutesRemaining = Math.ceil((lockUntil.getTime() - Date.now()) / 60000);
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'AccountLocked',
        message: `Account locked due to multiple failed login attempts. Try again in ${minutesRemaining} minutes.`,
        lockUntil: lockUntil.toISOString(),
        timestamp: new Date().toISOString(),
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * Thrown when attempting to register with an email that already exists
 */
export class EmailAlreadyExistsException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        error: 'EmailAlreadyExists',
        message: 'An account with this email already exists',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Thrown when session is not found or has expired
 */
export class SessionNotFoundException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'SessionNotFound',
        message: 'Session expired or invalid. Please login again.',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when refresh token is invalid or expired
 */
export class InvalidRefreshTokenException extends HttpException {
  constructor() {
    super(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        error: 'InvalidRefreshToken',
        message: 'Invalid or expired refresh token',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

/**
 * Thrown when rate limit is exceeded
 */
export class RateLimitExceededException extends HttpException {
  constructor(retryAfter: number) {
    super(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'RateLimitExceeded',
        message: 'Too many requests. Please try again later.',
        retryAfter,
        timestamp: new Date().toISOString(),
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/**
 * Thrown when user account is banned or suspended
 */
export class AccountSuspendedException extends HttpException {
  constructor(reason?: string) {
    super(
      {
        statusCode: HttpStatus.FORBIDDEN,
        error: 'AccountSuspended',
        message: reason || 'Your account has been suspended. Please contact support.',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
