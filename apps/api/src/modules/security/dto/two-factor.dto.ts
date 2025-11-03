import { z } from 'zod';

// Enable 2FA
export const enable2FASchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  token: z.string().length(6, '2FA token must be 6 digits').regex(/^\d{6}$/, '2FA token must be numeric'),
});

export type Enable2FADto = z.infer<typeof enable2FASchema>;

// Disable 2FA
export const disable2FASchema = z.object({
  token: z.string().length(6, '2FA token must be 6 digits').regex(/^\d{6}$/, '2FA token must be numeric'),
});

export type Disable2FADto = z.infer<typeof disable2FASchema>;

// Verify 2FA token
export const verify2FASchema = z.object({
  token: z.string().length(6, '2FA token must be 6 digits').regex(/^\d{6}$/, '2FA token must be numeric'),
});

export type Verify2FADto = z.infer<typeof verify2FASchema>;
