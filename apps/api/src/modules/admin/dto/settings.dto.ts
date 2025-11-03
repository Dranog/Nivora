import { z } from 'zod';

export const platformSettingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteDescription: z.string().max(500).optional(),
  maintenanceMode: z.boolean().default(false),
  registrationEnabled: z.boolean().default(true),
  minAge: z.number().int().min(18).max(21).default(18),
  defaultCurrency: z.string().length(3).default('USD'),
  platformFeePercent: z.number().min(0).max(100).default(20),
});

export type PlatformSettingsDto = z.infer<typeof platformSettingsSchema>;

export const securitySettingsSchema = z.object({
  mfaRequired: z.boolean().default(false),
  sessionTimeout: z.number().int().min(15).max(1440).default(60),
  passwordMinLength: z.number().int().min(8).max(128).default(12),
  maxLoginAttempts: z.number().int().min(3).max(10).default(5),
  ipWhitelist: z.array(z.string()).optional(),
});

export type SecuritySettingsDto = z.infer<typeof securitySettingsSchema>;

export const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  adminEmail: z.string().email(),
  alertThresholds: z.object({
    failedPayments: z.number().int().default(10),
    chargebacks: z.number().int().default(5),
    suspiciousActivity: z.number().int().default(3),
  }),
});

export type NotificationSettingsDto = z.infer<typeof notificationSettingsSchema>;
