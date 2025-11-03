/**
 * Middleware Tests - F1 Shell SPA
 * Test authentication guards and role-based redirections
 */

import { describe, it, expect } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../../middleware';

// Helper to create mock NextRequest
function createRequest(pathname: string, cookies: Record<string, string> = {}) {
  const url = new URL(pathname, 'http://localhost:3000');
  const request = new NextRequest(url);

  // Mock cookies
  Object.entries(cookies).forEach(([name, value]) => {
    request.cookies.set(name, value);
  });

  return request;
}

// Helper to create auth cookie
function createAuthCookie(
  isAuthenticated: boolean,
  role: 'fan' | 'creator' | 'admin' | null,
  onboardingDone: boolean
) {
  return JSON.stringify({
    state: {
      isAuthenticated,
      role,
      onboardingDone,
      userId: 'test-user-123',
    },
  });
}

describe('Middleware', () => {
  describe('Public Routes', () => {
    it('allows access to home page without auth', async () => {
      const request = createRequest('/');
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307); // Not a redirect
    });

    it('allows access to about page without auth', async () => {
      const request = createRequest('/about');
      const response = middleware(request);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).not.toBe(307);
    });
  });

  describe('Protected Routes - Unauthenticated', () => {
    it('redirects unauthenticated user from /fan to /', async () => {
      const request = createRequest('/fan');
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/');
    });

    it('redirects unauthenticated user from /creator to /', async () => {
      const request = createRequest('/creator');
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/');
    });

    it('redirects unauthenticated user from /admin to /', async () => {
      const request = createRequest('/admin');
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/');
    });

    it('redirects unauthenticated user from /settings to /', async () => {
      const request = createRequest('/settings');
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/');
    });
  });

  describe('Onboarding Flow', () => {
    it('redirects authenticated user without onboarding to /onboarding', async () => {
      const authCookie = createAuthCookie(true, 'fan', false);
      const request = createRequest('/fan', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/onboarding');
    });

    it('allows access to /onboarding when not completed', async () => {
      const authCookie = createAuthCookie(true, 'fan', false);
      const request = createRequest('/onboarding', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('redirects from /onboarding to dashboard when completed', async () => {
      const authCookie = createAuthCookie(true, 'fan', true);
      const request = createRequest('/onboarding', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/fan');
    });
  });

  describe('Role-Based Access Control', () => {
    it('allows fan to access /fan routes', async () => {
      const authCookie = createAuthCookie(true, 'fan', true);
      const request = createRequest('/fan', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('redirects fan trying to access /creator to /fan', async () => {
      const authCookie = createAuthCookie(true, 'fan', true);
      const request = createRequest('/creator', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/fan');
    });

    it('redirects fan trying to access /admin to /fan', async () => {
      const authCookie = createAuthCookie(true, 'fan', true);
      const request = createRequest('/admin', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/fan');
    });

    it('allows creator to access /creator routes', async () => {
      const authCookie = createAuthCookie(true, 'creator', true);
      const request = createRequest('/creator', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('redirects creator trying to access /fan to /creator', async () => {
      const authCookie = createAuthCookie(true, 'creator', true);
      const request = createRequest('/fan', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/creator');
    });

    it('allows admin to access /admin routes', async () => {
      const authCookie = createAuthCookie(true, 'admin', true);
      const request = createRequest('/admin', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).not.toBe(307);
    });

    it('redirects admin trying to access /fan to /admin', async () => {
      const authCookie = createAuthCookie(true, 'admin', true);
      const request = createRequest('/fan', { 'auth-storage': authCookie });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/admin');
    });
  });

  describe('Invalid Auth Cookie', () => {
    it('treats invalid JSON auth cookie as unauthenticated', async () => {
      const request = createRequest('/fan', { 'auth-storage': 'invalid-json' });
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/');
    });

    it('treats missing auth cookie as unauthenticated', async () => {
      const request = createRequest('/fan');
      const response = middleware(request);

      expect(response.status).toBe(307);
      expect(response.headers.get('location')).toContain('/');
    });
  });
});
