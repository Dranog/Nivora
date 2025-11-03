import { z } from 'zod';

// ============================================
// FLAG MANAGEMENT SCHEMAS
// ============================================

export const validateFlagSchema = z.object({
  flagId: z.string().min(1, 'Flag ID requis'),
  action: z.enum(['validate', 'ignore']),
  notes: z.string().max(500, 'Notes trop longues').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type ValidateFlagInput = z.infer<typeof validateFlagSchema>;

export const banCreatorFromFlagSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID requis'),
  flagIds: z.array(z.string()).min(1, 'Au moins un flag requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  permanent: z.boolean().default(true),
});

export type BanCreatorFromFlagInput = z.infer<typeof banCreatorFromFlagSchema>;

export const warnCreatorSchema = z.object({
  creatorId: z.string().min(1, 'Creator ID requis'),
  flagId: z.string().min(1, 'Flag ID requis'),
  severity: z.enum(['warn', 'suspend']),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  duration: z.number().int().min(1).max(365).optional(),
}).refine(
  (data) => {
    if (data.severity === 'suspend') {
      return data.duration !== undefined && data.duration > 0;
    }
    return true;
  },
  {
    message: 'Durée de suspension requise',
    path: ['duration'],
  }
);

export type WarnCreatorInput = z.infer<typeof warnCreatorSchema>;

// ============================================
// MESSAGE MANAGEMENT SCHEMAS
// ============================================

export const deleteMessageSchema = z.object({
  messageId: z.string().min(1, 'Message ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(500, 'Raison trop longue'),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type DeleteMessageInput = z.infer<typeof deleteMessageSchema>;

export const contactFanSchema = z.object({
  fanId: z.string().min(1, 'Fan ID requis'),
  subject: z.string().min(3, 'Sujet requis (min 3 caractères)').max(200, 'Sujet trop long'),
  message: z.string().min(20, 'Message requis (min 20 caractères)').max(5000, 'Message trop long'),
  adminId: z.string().min(1, 'Admin ID requis'),
  flagIds: z.array(z.string()).optional(),
});

export type ContactFanInput = z.infer<typeof contactFanSchema>;

export const closeConversationSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(1000, 'Raison trop longue'),
  adminId: z.string().min(1, 'Admin ID requis'),
  notifyParticipants: z.boolean().default(true),
});

export type CloseConversationInput = z.infer<typeof closeConversationSchema>;

export const exportConversationSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID requis'),
  format: z.enum(['json', 'pdf']),
  includeFlags: z.boolean().default(true),
  includeMetadata: z.boolean().default(true),
});

export type ExportConversationInput = z.infer<typeof exportConversationSchema>;

// ============================================
// MARKETPLACE SCHEMAS
// ============================================

export const reviewAnnonceResponseSchema = z.object({
  responseId: z.string().min(1, 'Response ID requis'),
  action: z.enum(['approve', 'reject', 'flag']),
  reason: z.string().max(500, 'Raison trop longue').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type ReviewAnnonceResponseInput = z.infer<typeof reviewAnnonceResponseSchema>;

export const exportMarketplaceDataSchema = z.object({
  fanId: z.string().min(1, 'Fan ID requis'),
  format: z.enum(['csv', 'json', 'pdf']).default('csv'),
  includeResponses: z.boolean().default(true),
  includeFlags: z.boolean().default(true),
  dateRange: z
    .object({
      from: z.date(),
      to: z.date(),
    })
    .optional(),
});

export type ExportMarketplaceDataInput = z.infer<typeof exportMarketplaceDataSchema>;

// ============================================
// BULK ACTION SCHEMAS
// ============================================

export const bulkFlagActionSchema = z.object({
  flagIds: z.array(z.string()).min(1, 'Au moins un flag requis'),
  action: z.enum(['validate', 'ignore', 'escalate']),
  notes: z.string().max(1000, 'Notes trop longues').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
});

export type BulkFlagActionInput = z.infer<typeof bulkFlagActionSchema>;

// ============================================
// MARKETPLACE PURCHASE ACTIONS SCHEMAS
// ============================================

export const forceRefundPurchaseSchema = z.object({
  purchaseId: z.string().min(1, 'Purchase ID requis'),
  amount: z.number().positive('Le montant doit être positif'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(500, 'Raison trop longue'),
  adminId: z.string().min(1, 'Admin ID requis'),
  notifyBoth: z.boolean().default(true),
});

export type ForceRefundPurchaseInput = z.infer<typeof forceRefundPurchaseSchema>;

export const resolveMarketplaceDisputeSchema = z.object({
  purchaseId: z.string().min(1, 'Purchase ID requis'),
  resolution: z.enum(['refund_fan', 'force_delivery', 'mediation']),
  messageToFan: z.string().min(20, 'Message au fan requis (min 20 caractères)').max(1000, 'Message trop long').optional(),
  messageToCreator: z.string().min(20, 'Message au créateur requis (min 20 caractères)').max(1000, 'Message trop long').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
}).refine(
  (data) => {
    // If resolution is mediation, at least one message must be provided
    if (data.resolution === 'mediation') {
      return data.messageToFan || data.messageToCreator;
    }
    return true;
  },
  {
    message: 'Au moins un message requis pour la médiation',
    path: ['messageToFan'],
  }
);

export type ResolveMarketplaceDisputeInput = z.infer<typeof resolveMarketplaceDisputeSchema>;

// ============================================
// CREATOR MARKETPLACE SCHEMAS
// ============================================

export const suspendCreatorAnnonceSchema = z.object({
  annonceId: z.string().min(1, 'Annonce ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(500, 'Raison trop longue'),
  adminId: z.string().min(1, 'Admin ID requis'),
  notifyCreator: z.boolean().default(true),
});

export type SuspendCreatorAnnonceInput = z.infer<typeof suspendCreatorAnnonceSchema>;

export const blockFraudulentResponseSchema = z.object({
  responseId: z.string().min(1, 'Response ID requis'),
  demandId: z.string().min(1, 'Demand ID requis'),
  reason: z.string().min(10, 'Raison requise (min 10 caractères)').max(500, 'Raison trop longue'),
  adminId: z.string().min(1, 'Admin ID requis'),
  warnCreator: z.boolean().default(false),
});

export type BlockFraudulentResponseInput = z.infer<typeof blockFraudulentResponseSchema>;

export const markOrderDeliveredSchema = z.object({
  orderId: z.string().min(1, 'Order ID requis'),
  deliveryNotes: z.string().max(1000, 'Notes trop longues').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
  notifyFan: z.boolean().default(true),
});

export type MarkOrderDeliveredInput = z.infer<typeof markOrderDeliveredSchema>;

export const resolveCreatorDisputeSchema = z.object({
  orderId: z.string().min(1, 'Order ID requis'),
  resolution: z.enum(['favor_fan', 'favor_creator', 'mediation']),
  messageToFan: z.string().min(20, 'Message au fan requis (min 20 caractères)').max(1000, 'Message trop long').optional(),
  messageToCreator: z.string().min(20, 'Message au créateur requis (min 20 caractères)').max(1000, 'Message trop long').optional(),
  adminId: z.string().min(1, 'Admin ID requis'),
}).refine(
  (data) => {
    // If resolution is mediation, at least one message must be provided
    if (data.resolution === 'mediation') {
      return data.messageToFan || data.messageToCreator;
    }
    return true;
  },
  {
    message: 'Au moins un message requis pour la médiation',
    path: ['messageToFan'],
  }
);

export type ResolveCreatorDisputeInput = z.infer<typeof resolveCreatorDisputeSchema>;

export const reportCreatorAnnonceSchema = z.object({
  annonceId: z.string().min(1, 'Annonce ID requis'),
  issueType: z.enum(['inappropriate_content', 'misleading_info', 'pricing_issue', 'violation_terms']),
  details: z.string().min(20, 'Détails requis (min 20 caractères)').max(1000, 'Détails trop longs'),
  adminId: z.string().min(1, 'Admin ID requis'),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
});

export type ReportCreatorAnnonceInput = z.infer<typeof reportCreatorAnnonceSchema>;
