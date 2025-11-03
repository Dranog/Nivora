// apps/api/src/modules/audit/dto/audit-log.dto.ts

import { z } from 'zod';

export const GetAuditLogsQuerySchema = z.object({
  actorId: z.string().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type GetAuditLogsQueryDto = z.infer<typeof GetAuditLogsQuerySchema>;

export const VerifyChainQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(10000).default(1000),
});

export type VerifyChainQueryDto = z.infer<typeof VerifyChainQuerySchema>;

export interface AuditLogItemDto {
  id: string;
  timestamp: Date;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string | null;
  metadata: any;
  ip: string;
  userAgent: string;
  device: string;
  hash: string;
  prevHash: string | null;
  actor?: {
    id: string;
    username: string;
    email: string;
    avatar: string | null;
  };
}

export interface AuditLogsResponseDto {
  items: AuditLogItemDto[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface VerifyChainResponseDto {
  valid: boolean;
  brokenAt?: string;
  message: string;
}
