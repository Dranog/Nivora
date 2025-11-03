/**
 * Token Management - F5 Anti-Leak
 * Mock implementation with in-memory single-use validation
 */

import type { PlaybackToken } from '@/types/protection';

/**
 * In-memory store for used tokens (single-use enforcement)
 * In production, this would be Redis or database
 */
const usedTokens = new Map<string, boolean>();

/**
 * Default TTL in minutes
 */
const DEFAULT_TTL_MINUTES = 15;

/**
 * Generate a playback token for media access
 * @param mediaId - Media identifier
 * @param ttlMinutes - Token TTL in minutes (default: 15)
 * @returns PlaybackToken with URL, expiry, and unique JTI
 */
export function getPlaybackToken(
  mediaId: string,
  ttlMinutes: number = DEFAULT_TTL_MINUTES
): PlaybackToken {
  const jti = `${mediaId}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  return {
    url: `/api/media/${mediaId}/stream?jti=${jti}`,
    expiresAt,
    jti,
  };
}

/**
 * Validate a token (single-use check)
 * @param jti - JWT identifier
 * @throws Error if token already used
 * @returns true if valid
 */
export function validateToken(jti: string): boolean {
  if (usedTokens.has(jti)) {
    throw new Error('Token already used');
  }

  usedTokens.set(jti, true);
  return true;
}

/**
 * Check if token is expired
 * @param expiresAt - Expiry timestamp in ms
 * @param nowFn - Function to get current time (for testing)
 * @returns true if expired
 */
export function isTokenExpired(expiresAt: number, nowFn: () => number = Date.now): boolean {
  return nowFn() >= expiresAt;
}

/**
 * Get time until token expiry in seconds
 * @param expiresAt - Expiry timestamp in ms
 * @param nowFn - Function to get current time (for testing)
 * @returns seconds until expiry (negative if already expired)
 */
export function getTimeUntilExpiry(expiresAt: number, nowFn: () => number = Date.now): number {
  return Math.floor((expiresAt - nowFn()) / 1000);
}

/**
 * Clear used tokens (for testing or cleanup)
 */
export function clearUsedTokens(): void {
  usedTokens.clear();
}

/**
 * Mock API response for token request
 * Simulates 401 if token validation fails
 */
export async function mockTokenRequest(
  mediaId: string,
  ttlMinutes?: number
): Promise<PlaybackToken> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return getPlaybackToken(mediaId, ttlMinutes);
}

/**
 * Mock API response for media streaming with token validation
 * @param jti - Token JWT ID
 * @throws Error with 401-like message if token invalid
 */
export async function mockStreamRequest(jti: string): Promise<void> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  try {
    validateToken(jti);
  } catch (error) {
    throw new Error('Unauthorized: Token already used or invalid');
  }
}
