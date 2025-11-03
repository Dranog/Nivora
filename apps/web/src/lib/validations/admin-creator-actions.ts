import { z } from 'zod';

// ============================================
// CREATOR MODERATION SCHEMAS
// ============================================

export const warnCreatorSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  severity: z.enum(['low', 'medium', 'high']),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type WarnCreatorInput = z.infer<typeof warnCreatorSchema>;

export const suspendCreatorSchema = z
  .object({
    creatorId: z.string().min(1, 'Creator ID requis'),
    reason: z.string().min(20, 'Raison requise (min 20 caractères)').max(1000, 'Raison trop longue'),
    duration: z.number().int().min(1).max(365),
    permanent: z.boolean().default(false),
    adminId: z.string().min(1, 'Admin ID requis'),
  })
  .refine(
    (data) => {
      if (!data.permanent) {
        return data.duration > 0;
      }
      return true;
    },
    {
      message: 'Durée requise pour suspension temporaire',
      path: ['duration'],
    }
  );

export type SuspendCreatorInput = z.infer<typeof suspendCreatorSchema>;

export const banCreatorSchema = z
  .object({
    creatorId: z.string().min(1, 'Creator ID requis'),
    reason: z.string().min(20, 'Raison requise (min 20 caractères)').max(1000, 'Raison trop longue'),
    confirmation: z.literal('BANNIR'),
    adminId: z.string().min(1, 'Admin ID requis'),
  })
  .refine((data) => data.confirmation === 'BANNIR', {
    message: 'Vous devez taper "BANNIR" pour confirmer',
    path: ['confirmation'],
  });

export type BanCreatorInput = z.infer<typeof banCreatorSchema>;

export const deleteCreatorSchema = z
  .object({
    creatorId: z.string().min(1, 'Creator ID requis'),
    reason: z.string().min(20, 'Raison requise (min 20 caractères)').max(1000, 'Raison trop longue'),
    confirmation: z.literal('SUPPRIMER DÉFINITIVEMENT'),
    deleteContent: z.boolean().default(true),
    adminId: z.string().min(1, 'Admin ID requis'),
  })
  .refine((data) => data.confirmation === 'SUPPRIMER DÉFINITIVEMENT', {
    message: 'Vous devez taper "SUPPRIMER DÉFINITIVEMENT" pour confirmer',
    path: ['confirmation'],
  });

export type DeleteCreatorInput = z.infer<typeof deleteCreatorSchema>;

// ============================================
// CONTENT MODERATION SCHEMAS
// ============================================

export const suspendContentSchema = z.object({
  contentId: z.string().min(1, 'Content ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  duration: z.number().int().min(1).max(365).optional(),
  permanent: z.boolean().default(false),
  notifyCreator: z.boolean().default(true),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type SuspendContentInput = z.infer<typeof suspendContentSchema>;

export const deleteContentSchema = z.object({
  contentId: z.string().min(1, 'Content ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  notifyCreator: z.boolean().default(true),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type DeleteContentInput = z.infer<typeof deleteContentSchema>;

// ============================================
// SUBSCRIBER MANAGEMENT SCHEMAS
// ============================================

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().min(1, 'Subscription ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
  fanId: z.string().min(1, 'Fan ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(500, 'Raison trop longue'),
  refund: z.boolean().default(false),
  notifyBoth: z.boolean().default(true),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;

// ============================================
// MARKETPLACE SCHEMAS
// ============================================

export const markOrderDeliveredSchema = z.object({
  orderId: z.string().min(1, 'Order ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
  deliveryNotes: z.string().max(500, 'Notes trop longues').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type MarkOrderDeliveredInput = z.infer<typeof markOrderDeliveredSchema>;

export const validateCreatorFlagSchema = z.object({
  flagId: z.string().min(1, 'Flag ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
  action: z.enum(['validate', 'ignore', 'escalate']),
  notes: z.string().max(500, 'Notes trop longues').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type ValidateCreatorFlagInput = z.infer<typeof validateCreatorFlagSchema>;

// ============================================
// REPORT RESOLUTION SCHEMAS
// ============================================

export const resolveCreatorReportSchema = z.object({
  reportId: z.string().min(1, 'Report ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
  action: z.enum(['dismiss', 'warn', 'suspend_content', 'suspend_account', 'ban']),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  suspendDuration: z.number().int().min(1).max(365).optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type ResolveCreatorReportInput = z.infer<typeof resolveCreatorReportSchema>;

// ============================================
// MESSAGES MODERATION SCHEMAS
// ============================================

export const deleteCreatorMessageSchema = z.object({
  messageId: z.string().min(1, 'Message ID requis'),
  conversationId: z.string().min(1, 'Conversation ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(500, 'Raison trop longue'),
  warnCreator: z.boolean().default(true),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type DeleteCreatorMessageInput = z.infer<typeof deleteCreatorMessageSchema>;

export const closeCreatorConversationSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID requis'),
  creatorId: z.string().min(1, 'Creator ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  notifyParticipants: z.boolean().default(true),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type CloseCreatorConversationInput = z.infer<typeof closeCreatorConversationSchema>;

export const contactCreatorSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID requis'),
  subject: z.string().min(3, 'Sujet requis (min 3 caractères)').max(200, 'Sujet trop long'),
  message: z.string().min(20, 'Message requis (min 20 caractères)').max(5000, 'Message trop long'),
  severity: z.enum(['info', 'warning', 'critical']),
  flagIds: z.array(z.string()).optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type ContactCreatorInput = z.infer<typeof contactCreatorSchema>;

// ============================================
// SETTINGS SCHEMAS
// ============================================

export const updateCreatorStatusSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID requis'),
  status: z.enum(['active', 'suspended', 'banned']),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(500, 'Raison trop longue'),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type UpdateCreatorStatusInput = z.infer<typeof updateCreatorStatusSchema>;

export const forceLogoutCreatorSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID requis'),
  reason: z.string().max(500, 'Raison trop longue').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type ForceLogoutCreatorInput = z.infer<typeof forceLogoutCreatorSchema>;

export const resetCreatorPasswordSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID requis'),
  sendEmail: z.boolean().default(true),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type ResetCreatorPasswordInput = z.infer<typeof resetCreatorPasswordSchema>;
