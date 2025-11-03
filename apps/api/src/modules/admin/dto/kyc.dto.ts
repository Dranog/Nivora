import { z } from 'zod';

export enum KycStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUIRES_INFO = 'REQUIRES_INFO',
}

export const kycQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(KycStatus).optional(),
  search: z.string().optional(),
});

export type KycQuery = z.infer<typeof kycQuerySchema>;

export const kycSubmissionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: z.object({ id: z.string(), username: z.string(), email: z.string() }),
  status: z.nativeEnum(KycStatus),
  documentType: z.string(),
  documentUrl: z.string(),
  notes: z.string().nullable(),
  submittedAt: z.string().datetime(),
  reviewedAt: z.string().datetime().nullable(),
  reviewedBy: z.object({ id: z.string(), username: z.string() }).nullable(),
});

export type KycSubmissionDto = z.infer<typeof kycSubmissionSchema>;

export const kycListResponseSchema = z.object({
  items: z.array(kycSubmissionSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type KycListResponseDto = z.infer<typeof kycListResponseSchema>;

export const reviewKycSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'REQUIRES_INFO']),
  notes: z.string().min(10).max(1000),
});

export type ReviewKycDto = z.infer<typeof reviewKycSchema>;
