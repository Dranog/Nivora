import { z } from 'zod';

// ============================================
// EMAIL SCHEMAS
// ============================================

export const sendEmailSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  subject: z.string().min(3, 'Sujet requis (min 3 caractères)').max(200, 'Sujet trop long (max 200)'),
  message: z.string().min(10, 'Message requis (min 10 caractères)').max(5000, 'Message trop long (max 5000)'),
});

export type SendEmailInput = z.infer<typeof sendEmailSchema>;

// ============================================
// USER MANAGEMENT SCHEMAS
// ============================================

export const suspendUserSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  duration: z.enum(['1', '3', '7', '14', '30', '90', 'custom']),
  durationDays: z.number().int().min(1).max(365).optional(),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
}).refine(
  (data) => {
    if (data.duration === 'custom') {
      return data.durationDays !== undefined;
    }
    return true;
  },
  {
    message: 'Nombre de jours requis pour durée personnalisée',
    path: ['durationDays'],
  }
);

export type SuspendUserInput = z.infer<typeof suspendUserSchema>;

export const banUserSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  reason: z.string().min(20, 'Raison requise (min 20 caractères pour bannissement)').max(1000, 'Raison trop longue'),
  confirmation: z.literal('BANNIR'),
}).refine((data) => data.confirmation === 'BANNIR', {
  message: 'Vous devez taper "BANNIR" pour confirmer',
  path: ['confirmation'],
});

export type BanUserInput = z.infer<typeof banUserSchema>;

export const deleteUserSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  reason: z.string().min(20, 'Raison requise (min 20 caractères)').max(1000, 'Raison trop longue'),
  confirmation: z.literal('SUPPRIMER DÉFINITIVEMENT'),
}).refine((data) => data.confirmation === 'SUPPRIMER DÉFINITIVEMENT', {
  message: 'Vous devez taper "SUPPRIMER DÉFINITIVEMENT" pour confirmer',
  path: ['confirmation'],
});

export type DeleteUserInput = z.infer<typeof deleteUserSchema>;

// ============================================
// NOTES & WARNINGS SCHEMAS
// ============================================

export const addNoteSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  content: z.string().min(5, 'Note trop courte (min 5 caractères)').max(1000, 'Note trop longue (max 1000)'),
  author: z.string().min(1, 'Auteur requis'),
});

export type AddNoteInput = z.infer<typeof addNoteSchema>;

export const addWarningSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(500, 'Raison trop longue'),
  issuedBy: z.string().min(1, 'Émetteur requis'),
});

export type AddWarningInput = z.infer<typeof addWarningSchema>;

// ============================================
// MODERATION SCHEMAS
// ============================================

export const resolveReportSchema = z.object({
  reportId: z.string().min(1, 'Report ID requis'),
  action: z.enum(['dismiss', 'warn', 'suspend', 'ban']),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  suspendDuration: z.number().int().min(1).max(365).optional(),
});

export type ResolveReportInput = z.infer<typeof resolveReportSchema>;

// ============================================
// FINANCIAL SCHEMAS
// ============================================

export const refundTransactionSchema = z.object({
  transactionId: z.string().min(1, 'Transaction ID requis'),
  reason: z.string().max(500, 'Raison trop longue').optional(),
  amount: z.number().positive('Montant invalide').optional(),
});

export type RefundTransactionInput = z.infer<typeof refundTransactionSchema>;

// ============================================
// CONTENT SCHEMAS
// ============================================

export const unfollowCreatorSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
});

export type UnfollowCreatorInput = z.infer<typeof unfollowCreatorSchema>;

export const cancelSubscriptionSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  subscriptionId: z.string().min(1, 'Subscription ID requis'),
  reason: z.string().max(500, 'Raison trop longue').optional(),
});

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

// ============================================
// SETTINGS SCHEMAS
// ============================================

export const toggleAccountStatusSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  status: z.enum(['active', 'suspended', 'banned']),
});

export type ToggleAccountStatusInput = z.infer<typeof toggleAccountStatusSchema>;

export const forceLogoutSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  reason: z.string().max(500, 'Raison trop longue').optional(),
});

export type ForceLogoutInput = z.infer<typeof forceLogoutSchema>;

export const resetPasswordSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  sendEmail: z.boolean().default(true),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ============================================
// EXPORT SCHEMAS
// ============================================

export const exportDataSchema = z.object({
  userId: z.string().min(1, 'User ID requis'),
  dataType: z.enum(['analytics', 'finances', 'activity', 'all']),
  format: z.enum(['csv', 'json', 'pdf']).default('csv'),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
});

export type ExportDataInput = z.infer<typeof exportDataSchema>;
