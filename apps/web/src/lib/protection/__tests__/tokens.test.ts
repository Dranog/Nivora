/**
 * Token System Tests - F5 Anti-Leak
 * Test 3: Single-use token validation - duplicate JTI rejection
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPlaybackToken,
  validateToken,
  isTokenExpired,
  getTimeUntilExpiry,
  mockTokenRequest,
  clearUsedTokens,
} from '@/lib/protection/tokens';
import { flushPromises } from '@/__tests__/utils/flushPromises';

describe('Token System - F5', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    clearUsedTokens();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    clearUsedTokens();
  });

  describe('Test 3: Single-use token validation', () => {
    it('generates unique JTI for each token', () => {
      const token1 = getPlaybackToken('media-1', 15);
      const token2 = getPlaybackToken('media-1', 15);
      const token3 = getPlaybackToken('media-2', 15);

      expect(token1.jti).not.toBe(token2.jti);
      expect(token2.jti).not.toBe(token3.jti);
      expect(token1.jti).not.toBe(token3.jti);
    });

    it('validates token on first use', () => {
      const token = getPlaybackToken('media-1', 15);

      // First validation should succeed
      expect(() => validateToken(token.jti)).not.toThrow();
    });

    it('rejects token on second use (single-use enforcement)', () => {
      const token = getPlaybackToken('media-1', 15);

      // First use - OK
      validateToken(token.jti);

      // Second use - should throw error
      expect(() => validateToken(token.jti)).toThrow('Token already used');
    });

    it('rejects multiple attempts with same JTI', () => {
      const token = getPlaybackToken('media-1', 15);

      // First use
      validateToken(token.jti);

      // Multiple subsequent attempts should all fail
      expect(() => validateToken(token.jti)).toThrow('Token already used');
      expect(() => validateToken(token.jti)).toThrow('Token already used');
      expect(() => validateToken(token.jti)).toThrow('Token already used');
    });

    it('allows independent tokens for different media', () => {
      const token1 = getPlaybackToken('media-1', 15);
      const token2 = getPlaybackToken('media-2', 15);

      // Both should validate successfully
      expect(() => validateToken(token1.jti)).not.toThrow();
      expect(() => validateToken(token2.jti)).not.toThrow();
    });

    it('marks token as used after validation', () => {
      const token = getPlaybackToken('media-1', 15);

      // Validate once
      const isValid = validateToken(token.jti);
      expect(isValid).toBe(true);

      // Token should now be marked as used
      expect(() => validateToken(token.jti)).toThrow('Token already used');
    });

    it('rejects reused JTI even after time delay', () => {
      const token = getPlaybackToken('media-1', 15);

      // Use token
      validateToken(token.jti);

      // Advance time by 5 minutes
      vi.advanceTimersByTime(5 * 60 * 1000);

      // Should still reject the used token
      expect(() => validateToken(token.jti)).toThrow('Token already used');
    });

    it('prevents URL sharing by rejecting duplicate JTI', () => {
      const token = getPlaybackToken('media-1', 15);

      // User A uses the token
      validateToken(token.jti);

      // User B tries to use the same URL (same JTI)
      expect(() => validateToken(token.jti)).toThrow('Token already used');
    });
  });

  describe('Token expiration', () => {
    it('generates token with correct TTL', () => {
      const now = Date.now();
      const ttlMinutes = 15;
      const token = getPlaybackToken('media-1', ttlMinutes);

      const expectedExpiry = now + ttlMinutes * 60 * 1000;
      const tolerance = 100; // 100ms tolerance

      expect(token.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
      expect(token.expiresAt).toBeLessThanOrEqual(expectedExpiry + tolerance);
    });

    it('correctly identifies expired tokens', () => {
      const expiredTime = Date.now() - 1000; // 1 second ago
      expect(isTokenExpired(expiredTime)).toBe(true);

      const futureTime = Date.now() + 60000; // 1 minute from now
      expect(isTokenExpired(futureTime)).toBe(false);
    });

    it('calculates time until expiry correctly', () => {
      const futureTime = Date.now() + 60000; // 60 seconds from now
      const timeUntilExpiry = getTimeUntilExpiry(futureTime);

      // Should be approximately 60 seconds (with small tolerance)
      expect(timeUntilExpiry).toBeGreaterThanOrEqual(59);
      expect(timeUntilExpiry).toBeLessThanOrEqual(60);
    });

    it('returns negative time for expired tokens', () => {
      const pastTime = Date.now() - 5000; // 5 seconds ago
      const timeUntilExpiry = getTimeUntilExpiry(pastTime);

      expect(timeUntilExpiry).toBeLessThan(0);
    });
  });

  describe('Token structure', () => {
    it('includes mediaId in URL', () => {
      const token = getPlaybackToken('test-media-123', 15);

      expect(token.url).toContain('test-media-123');
      expect(token.url).toMatch(/^\/api\/media\/.+\/stream/);
    });

    it('includes JTI in URL query parameter', () => {
      const token = getPlaybackToken('media-1', 15);

      expect(token.url).toContain(`jti=${token.jti}`);
    });

    it('has all required fields', () => {
      const token = getPlaybackToken('media-1', 15);

      expect(token).toHaveProperty('url');
      expect(token).toHaveProperty('expiresAt');
      expect(token).toHaveProperty('jti');

      expect(typeof token.url).toBe('string');
      expect(typeof token.expiresAt).toBe('number');
      expect(typeof token.jti).toBe('string');
    });
  });

  describe('Mock token request', () => {
    it('simulates async token request', async () => {
      const tokenPromise = mockTokenRequest('media-1', 15);

      // Run all timers to resolve setTimeout in mockTokenRequest
      await vi.runAllTimersAsync();

      const token = await tokenPromise;

      expect(token).toHaveProperty('url');
      expect(token).toHaveProperty('expiresAt');
      expect(token).toHaveProperty('jti');
    });

    it('generates unique tokens on multiple requests', async () => {
      const token1Promise = mockTokenRequest('media-1', 15);
      await vi.runAllTimersAsync();
      const token1 = await token1Promise;

      const token2Promise = mockTokenRequest('media-1', 15);
      await vi.runAllTimersAsync();
      const token2 = await token2Promise;

      expect(token1.jti).not.toBe(token2.jti);
    });

    it('uses default TTL when not specified', async () => {
      const now = Date.now();
      const tokenPromise = mockTokenRequest('media-1');

      await vi.runAllTimersAsync();

      const token = await tokenPromise;

      // Default TTL is 15 minutes
      const expectedExpiry = now + 15 * 60 * 1000;
      const tolerance = 100;

      expect(token.expiresAt).toBeGreaterThanOrEqual(expectedExpiry - tolerance);
      expect(token.expiresAt).toBeLessThanOrEqual(expectedExpiry + tolerance);
    });
  });

  describe('Security: Single-use enforcement scenarios', () => {
    it('prevents token replay attack', () => {
      const token = getPlaybackToken('media-1', 15);

      // Legitimate use
      validateToken(token.jti);

      // Attacker tries to replay the token
      expect(() => validateToken(token.jti)).toThrow('Token already used');
    });

    it('prevents URL sharing between users', () => {
      const token = getPlaybackToken('premium-video', 30);

      // Subscriber A uses the token
      validateToken(token.jti);

      // Subscriber A shares URL with non-subscriber B
      // Non-subscriber B tries to use the same token
      expect(() => validateToken(token.jti)).toThrow('Token already used');
    });

    it('requires new token for each playback session', () => {
      const mediaId = 'exclusive-content';

      // Session 1
      const token1 = getPlaybackToken(mediaId, 15);
      validateToken(token1.jti);
      expect(() => validateToken(token1.jti)).toThrow('Token already used');

      // Session 2 - requires new token
      const token2 = getPlaybackToken(mediaId, 15);
      expect(() => validateToken(token2.jti)).not.toThrow();

      // Session 3 - requires new token
      const token3 = getPlaybackToken(mediaId, 15);
      expect(() => validateToken(token3.jti)).not.toThrow();
    });

    it('prevents concurrent use of same token', () => {
      const token = getPlaybackToken('media-1', 15);

      // First client validates
      validateToken(token.jti);

      // Second client tries to validate concurrently
      expect(() => validateToken(token.jti)).toThrow('Token already used');
    });
  });
});
