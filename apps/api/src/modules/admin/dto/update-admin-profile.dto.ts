import { z } from 'zod';

// Schema for updating admin profile
export const updateAdminProfileSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Le nom doit contenir au moins 2 caractères')
      .max(100)
      .optional(),
    avatarUrl: z.string().url('URL invalide').optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      // If any password field is filled, all must be filled
      const hasAnyPassword =
        data.currentPassword || data.newPassword || data.confirmPassword;
      if (hasAnyPassword) {
        return (
          data.currentPassword && data.newPassword && data.confirmPassword
        );
      }
      return true;
    },
    {
      message:
        'Tous les champs mot de passe sont requis si vous souhaitez changer votre mot de passe',
      path: ['currentPassword'],
    },
  )
  .refine(
    (data) => {
      // Validate new password strength if provided
      if (data.newPassword) {
        const hasUpperCase = /[A-Z]/.test(data.newPassword);
        const hasNumber = /[0-9]/.test(data.newPassword);
        const hasMinLength = data.newPassword.length >= 8;
        return hasUpperCase && hasNumber && hasMinLength;
      }
      return true;
    },
    {
      message:
        'Le mot de passe doit contenir au moins 8 caractères, 1 majuscule et 1 chiffre',
      path: ['newPassword'],
    },
  )
  .refine(
    (data) => {
      // Check passwords match if new password is provided
      if (data.newPassword) {
        return data.newPassword === data.confirmPassword;
      }
      return true;
    },
    {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    },
  );

export type UpdateAdminProfileDto = z.infer<typeof updateAdminProfileSchema>;
