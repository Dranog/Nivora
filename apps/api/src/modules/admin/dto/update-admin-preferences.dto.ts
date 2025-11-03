import { z } from 'zod';

// Schema for updating admin preferences
export const updateAdminPreferencesSchema = z.object({
  language: z.enum(['fr', 'en', 'es', 'de']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  compactMode: z.boolean().optional(),
});

export type UpdateAdminPreferencesDto = z.infer<
  typeof updateAdminPreferencesSchema
>;
