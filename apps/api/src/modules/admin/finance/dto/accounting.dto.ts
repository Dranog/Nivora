// apps/api/src/modules/admin/finance/dto/accounting.dto.ts

import { z } from 'zod';
import { ReconciliationStatus } from '@prisma/client';

// ============================================================================
// V2 SCHEMAS - Export and Summary
// ============================================================================

export const GetAccountingSummarySchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  year: z.coerce.number().min(2020).max(2030).default(new Date().getFullYear()),
  month: z.coerce.number().min(1).max(12).optional(),
});

export const ExportAccountingSchema = z.object({
  type: z.enum(['accounting', 'transactions', 'payouts']),
  format: z.enum(['csv', 'pdf', 'xlsx']),
  dateFrom: z.string(),
  dateTo: z.string(),
});

export const GetExportHistorySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type GetAccountingSummaryDto = z.infer<typeof GetAccountingSummarySchema>;
export type ExportAccountingDto = z.infer<typeof ExportAccountingSchema>;
export type GetExportHistoryDto = z.infer<typeof GetExportHistorySchema>;

// ============================================================================
// V1 SCHEMAS - Reports and Reconciliation
// ============================================================================

// Enums
export enum ReportType {
  REVENUE = 'REVENUE',
  PAYOUTS = 'PAYOUTS',
  FEES = 'FEES',
  REFUNDS = 'REFUNDS',
  CHARGEBACKS = 'CHARGEBACKS',
  TAX = 'TAX',
}

export enum ReportPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export enum ExportFormat {
  CSV = 'CSV',
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
}

// Report Generation Schemas
export const generateReportSchema = z.object({
  type: z.nativeEnum(ReportType),
  period: z.nativeEnum(ReportPeriod),
  startDate: z.string(), // ISO date
  endDate: z.string(), // ISO date
  filters: z
    .object({
      userId: z.string().optional(),
      authorId: z.string().optional(),
      paymentMethod: z.string().optional(),
      status: z.string().optional(),
    })
    .optional(),
});

export type GenerateReportDto = z.infer<typeof generateReportSchema>;

export const exportDataSchema = z.object({
  type: z.nativeEnum(ReportType),
  format: z.nativeEnum(ExportFormat),
  startDate: z.string(),
  endDate: z.string(),
  includeDetails: z.boolean().default(false),
  filters: z
    .object({
      userId: z.string().optional(),
      authorId: z.string().optional(),
    })
    .optional(),
});

export type ExportDataDto = z.infer<typeof exportDataSchema>;

// Report Data Schemas
export const revenueReportSchema = z.object({
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  summary: z.object({
    totalRevenue: z.number().nonnegative(),
    totalTransactions: z.number().int().nonnegative(),
    totalFees: z.number().nonnegative(),
    netRevenue: z.number().nonnegative(),
    averageTransactionAmount: z.number().nonnegative(),
  }),
  breakdown: z.object({
    byType: z.array(
      z.object({
        type: z.string(),
        count: z.number().int().nonnegative(),
        amount: z.number().nonnegative(),
      })
    ),
    byPaymentMethod: z.array(
      z.object({
        method: z.string(),
        count: z.number().int().nonnegative(),
        amount: z.number().nonnegative(),
      })
    ),
    daily: z.array(
      z.object({
        date: z.string(),
        transactions: z.number().int().nonnegative(),
        revenue: z.number().nonnegative(),
      })
    ),
  }),
  topCreators: z.array(
    z.object({
      authorId: z.string(),
      username: z.string(),
      revenue: z.number().nonnegative(),
      transactionCount: z.number().int().nonnegative(),
    })
  ),
});

export type RevenueReportDto = z.infer<typeof revenueReportSchema>;

export const payoutsReportSchema = z.object({
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
  summary: z.object({
    totalPayouts: z.number().nonnegative(),
    payoutCount: z.number().int().nonnegative(),
    pendingPayouts: z.number().nonnegative(),
    completedPayouts: z.number().nonnegative(),
    failedPayouts: z.number().nonnegative(),
  }),
  breakdown: z.object({
    byStatus: z.array(
      z.object({
        status: z.string(),
        count: z.number().int().nonnegative(),
        amount: z.number().nonnegative(),
      })
    ),
    byCreator: z.array(
      z.object({
        authorId: z.string(),
        username: z.string(),
        totalPaid: z.number().nonnegative(),
        payoutCount: z.number().int().nonnegative(),
      })
    ),
  }),
});

export type PayoutsReportDto = z.infer<typeof payoutsReportSchema>;

// Reconciliation Schemas
export const reconciliationRecordSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  externalReference: z.string(),
  amount: z.number(),
  status: z.nativeEnum(ReconciliationStatus),
  reconciliationDate: z.string().datetime().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type ReconciliationRecordDto = z.infer<typeof reconciliationRecordSchema>;

export const reconciliationQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.nativeEnum(ReconciliationStatus).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(['createdAt', 'amount', 'status']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type ReconciliationQuery = z.infer<typeof reconciliationQuerySchema>;

export const reconciliationListResponseSchema = z.object({
  items: z.array(reconciliationRecordSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

export type ReconciliationListResponseDto = z.infer<
  typeof reconciliationListResponseSchema
>;

export const updateReconciliationSchema = z.object({
  status: z.nativeEnum(ReconciliationStatus),
  notes: z.string().max(2000).optional(),
});

export type UpdateReconciliationDto = z.infer<typeof updateReconciliationSchema>;

// Export History Schemas
export const exportHistorySchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ReportType),
  format: z.nativeEnum(ExportFormat),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED']),
  fileUrl: z.string().nullable(),
  error: z.string().nullable(),
  generatedBy: z.object({
    id: z.string(),
    username: z.string(),
  }),
  createdAt: z.string().datetime(),
});

export type ExportHistoryDto = z.infer<typeof exportHistorySchema>;

export const exportHistoryListSchema = z.object({
  items: z.array(exportHistorySchema),
  total: z.number().int().nonnegative(),
});

export type ExportHistoryListDto = z.infer<typeof exportHistoryListSchema>;
