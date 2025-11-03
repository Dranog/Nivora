import { z } from 'zod';

export const auditQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(50),
  userId: z.string().optional(),
  action: z.string().optional(),
  resource: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type AuditQuery = z.infer<typeof auditQuerySchema>;

export const auditLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: z.object({ id: z.string(), username: z.string(), email: z.string() }),
  action: z.string(),
  resource: z.string().nullable(),
  metadata: z.any().nullable(),
  ipAddress: z.string().nullable(),
  userAgent: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type AuditLogDto = z.infer<typeof auditLogSchema>;

export const auditListResponseSchema = z.object({
  items: z.array(auditLogSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type AuditListResponseDto = z.infer<typeof auditListResponseSchema>;
