/**
 * Protection Types - F5 Anti-Leak
 */

import { z } from 'zod';

/**
 * Watermark configuration
 */
export const watermarkConfigSchema = z.object({
  enabled: z.boolean().default(true),
  opacity: z.number().min(0).max(100).default(30), // 0-100%
  interval: z.enum(['15', '30', '60']).default('30'), // seconds between position changes
});

export type WatermarkConfig = z.infer<typeof watermarkConfigSchema>;

/**
 * Token configuration
 */
export const tokenConfigSchema = z.object({
  ttl: z.enum(['5', '15', '30', '60']).default('15'), // minutes
});

export type TokenConfig = z.infer<typeof tokenConfigSchema>;

/**
 * Protection settings (creator-level)
 */
export const protectionSettingsSchema = z.object({
  watermark: watermarkConfigSchema,
  token: tokenConfigSchema,
});

export type ProtectionSettings = z.infer<typeof protectionSettingsSchema>;

/**
 * Playback token
 */
export interface PlaybackToken {
  url: string;
  expiresAt: number; // timestamp in ms
  jti: string; // JWT ID (unique token identifier)
}

/**
 * Playback token response
 */
export interface PlaybackTokenResponse {
  token: PlaybackToken;
}

/**
 * Media access state
 */
export type MediaAccessState = 'locked' | 'unlocked' | 'loading' | 'error';

/**
 * Watermark position
 */
export interface WatermarkPosition {
  top: string;
  left: string;
  transform: string;
}
