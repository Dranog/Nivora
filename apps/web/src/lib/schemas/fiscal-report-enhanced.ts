/**
 * Enhanced Fiscal Report Schemas with Advanced Options
 * @module lib/schemas/fiscal-report-enhanced
 */

import { z } from 'zod';

/**
 * Schema pour les options avancées du rapport
 */
export const ReportOptionsSchema = z.object({
  includeAnnexes: z.boolean().default(true),
  includeTVA: z.boolean().default(true),
  includeBalance: z.boolean().default(true).describe('Inclure le bilan comptable'),
  includeResultAccount: z
    .boolean()
    .default(true)
    .describe('Inclure le compte de résultat détaillé'),
  includeDepreciation: z
    .boolean()
    .default(false)
    .describe('Inclure le tableau des amortissements'),
  includeCashFlow: z
    .boolean()
    .default(false)
    .describe('Inclure le tableau de flux de trésorerie'),
  format: z
    .enum(['detailed', 'summary'])
    .default('detailed')
    .describe('Format du rapport (synthétique ou détaillé)'),
  exportFormat: z
    .enum(['pdf', 'excel'])
    .default('pdf')
    .describe('Format d\'export (PDF ou Excel)'),
});

export type ReportOptions = z.infer<typeof ReportOptionsSchema>;

/**
 * Schema pour la période personnalisée
 */
export const CustomPeriodSchema = z
  .object({
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  })
  .refine((data) => new Date(data.startDate) < new Date(data.endDate), {
    message: 'La date de fin doit être après la date de début',
    path: ['endDate'],
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays >= 1 && diffDays <= 366;
    },
    {
      message: 'La période doit être comprise entre 1 et 366 jours',
      path: ['endDate'],
    }
  );

export type CustomPeriod = z.infer<typeof CustomPeriodSchema>;

/**
 * Schema pour la requête de génération complète
 */
export const EnhancedFiscalReportRequestSchema = z.object({
  exercice: z
    .number()
    .int('L\'exercice doit être un nombre entier')
    .min(2020, 'L\'exercice ne peut pas être antérieur à 2020')
    .max(2030, 'L\'exercice ne peut pas être postérieur à 2030'),
  periodType: z.enum(['full', 'custom']).default('full'),
  customPeriod: CustomPeriodSchema.optional(),
  options: ReportOptionsSchema,
});

export type EnhancedFiscalReportRequest = z.infer<typeof EnhancedFiscalReportRequestSchema>;

/**
 * Schema pour l'état de génération progressive
 */
export const GenerationProgressSchema = z.object({
  step: z.enum([
    'init',
    'fetching',
    'calculating',
    'balance',
    'result',
    'tva',
    'depreciation',
    'cashflow',
    'generating_pdf',
    'generating_excel',
    'finalizing',
    'completed',
  ]),
  progress: z.number().int().min(0).max(100),
  message: z.string(),
});

export type GenerationProgress = z.infer<typeof GenerationProgressSchema>;

/**
 * Schema pour l'historique des rapports générés
 */
export const GeneratedReportSchema = z.object({
  id: z.string().uuid(),
  exercice: z.number().int(),
  periodType: z.enum(['full', 'custom']),
  customPeriod: CustomPeriodSchema.optional(),
  options: ReportOptionsSchema,
  generatedAt: z.string().datetime(),
  fileUrl: z.string().url().optional(),
  fileSize: z.number().int().min(0).describe('Taille du fichier en octets'),
  format: z.enum(['pdf', 'excel']),
});

export type GeneratedReport = z.infer<typeof GeneratedReportSchema>;

/**
 * Schema pour la validation pré-génération
 */
export const PreGenerationValidationSchema = z.object({
  transactionsCount: z.number().int().min(0),
  hasTVAData: z.boolean(),
  hasCompleteData: z.boolean(),
  warnings: z.array(z.string()),
  canGenerate: z.boolean(),
});

export type PreGenerationValidation = z.infer<typeof PreGenerationValidationSchema>;

/**
 * Helper pour calculer le nombre de sections dans le rapport
 */
export function getReportSections(options: ReportOptions): string[] {
  const sections: string[] = ['Page de garde', 'Synthèse exécutive'];

  if (options.includeBalance) {
    sections.push('Bilan comptable');
  }

  if (options.includeResultAccount) {
    sections.push('Compte de résultat');
  }

  if (options.includeAnnexes) {
    sections.push('Tableau des immobilisations', 'État des créances et dettes');
  }

  if (options.includeDepreciation) {
    sections.push('Tableau des amortissements');
  }

  if (options.includeTVA) {
    sections.push('Déclarations TVA');
  }

  if (options.includeCashFlow) {
    sections.push('Tableau de flux de trésorerie');
  }

  sections.push('Indicateurs clés');

  return sections;
}

/**
 * Helper pour estimer le nombre de pages
 */
export function estimatePageCount(options: ReportOptions): number {
  const sections = getReportSections(options);
  const basePages = 3; // Page de garde + synthèse + indicateurs

  let additionalPages = 0;

  if (options.includeBalance) additionalPages += 2;
  if (options.includeResultAccount) additionalPages += 2;
  if (options.includeAnnexes) additionalPages += 3;
  if (options.includeDepreciation) additionalPages += 2;
  if (options.includeTVA) additionalPages += 2;
  if (options.includeCashFlow) additionalPages += 2;

  // Ajuster selon le format
  const multiplier = options.format === 'detailed' ? 1.5 : 0.7;

  return Math.ceil((basePages + additionalPages) * multiplier);
}

/**
 * Helper pour formater la taille de fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

/**
 * Helper pour calculer la période en jours
 */
export function calculatePeriodDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
