// ==========================================
// apps/web/lib/utils.ts
// ==========================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'relative' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'relative') {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
  }

  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
}

// ==========================================
// apps/api/src/common/pipes/zod-validation.pipe.ts
// ==========================================

import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((err) => {
          const path = err.path.join('.');
          return `${path}: ${err.message}`;
        });
        throw new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      }
      throw error;
    }
  }
}

// ==========================================
// apps/api/src/modules/admin/guards/admin-role.guard.ts
// ==========================================

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const adminRoles = ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'];

    if (!adminRoles.includes(user.role)) {
      throw new ForbiddenException('Access restricted to admin users only');
    }

    return true;
  }
}

// ==========================================
// apps/api/src/modules/admin/guards/permissions.guard.ts
// ==========================================

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

const PERMISSIONS: Record<string, string[]> = {
  'users.read': ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'],
  'users.write': ['ADMIN'],
  'users.suspend': ['ADMIN', 'SENIOR_MODERATOR'],
  'users.delete': ['ADMIN'],
  'kyc.view': ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'],
  'kyc.approve': ['ADMIN', 'SENIOR_MODERATOR'],
  'settings.read': ['ADMIN'],
  'settings.write': ['ADMIN'],
  'reports.view': ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'],
  'reports.moderate': ['ADMIN', 'MODERATOR', 'SENIOR_MODERATOR'],
};

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const permission = this.reflector.get<string>('permission', context.getHandler());
    
    if (!permission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const allowedRoles = PERMISSIONS[permission];
    
    if (!allowedRoles) {
      throw new ForbiddenException(`Unknown permission: ${permission}`);
    }

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException(`Insufficient permissions: ${permission} required`);
    }

    return true;
  }
}

// ==========================================
// apps/api/src/common/guards/rate-limit.guard.ts
// ==========================================

import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '../../modules/cache/redis.service';

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    const key = `rate-limit:${user.id}:${Date.now() / (60 * 1000)}`;
    const limit = 100;
    
    const current = await this.redis.incr(key);
    
    if (current === 1) {
      await this.redis.expire(key, 60);
    }

    if (current > limit) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Please try again later.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}

// ==========================================
// apps/api/src/common/guards/jwt-auth.guard.ts
// ==========================================

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw err || new UnauthorizedException('Invalid or expired token');
    }
    return user;
  }
}

// ==========================================
// apps/api/src/modules/admin/decorators/permissions.decorator.ts
// ==========================================

import { SetMetadata } from '@nestjs/common';

export const RequirePermission = (permission: string) => SetMetadata('permission', permission);

// ==========================================
// apps/web/hooks/use-debounce.ts
// ==========================================

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ==========================================
// apps/web/lib/admin/api-client.ts - UPDATED WITH NEW METHODS
// ==========================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class AdminApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
  }

  private async fetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
  }

  users = {
    getUsers: (query: any) => {
      const params = new URLSearchParams();
      Object.keys(query).forEach((key) => {
        if (query[key] !== undefined) params.append(key, query[key].toString());
      });
      return this.fetch(`/admin/users?${params}`);
    },
    getUserById: (userId: string) => this.fetch(`/admin/users/${userId}`),
    suspendUser: (userId: string, dto: any) =>
      this.fetch(`/admin/users/${userId}/suspend`, {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    unsuspendUser: (userId: string) =>
      this.fetch(`/admin/users/${userId}/unsuspend`, {
        method: 'POST',
      }),
    bulkSuspend: (dto: any) =>
      this.fetch('/admin/users/bulk-suspend', {
        method: 'POST',
        body: JSON.stringify(dto),
      }),
    resetPassword: (userId: string) =>
      this.fetch(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
      }),
    deleteUser: (userId: string) =>
      this.fetch(`/admin/users/${userId}`, {
        method: 'DELETE',
      }),
  };

  // ... (rest of the API client remains the same as in document 14)
}

export const adminApi = new AdminApiClient();