/**
 * Fiscal Report Schemas - Validation conforme DGFiP
 * @module lib/schemas/fiscal-report
 */

import { z } from 'zod';

/**
 * Schema pour la requête de génération de rapport fiscal
 */
export const FiscalReportRequestSchema = z.object({
  exercice: z
    .number()
    .int('L\'exercice doit être un nombre entier')
    .min(2020, 'L\'exercice ne peut pas être antérieur à 2020')
    .max(2030, 'L\'exercice ne peut pas être postérieur à 2030'),
  startDate: z
    .string()
    .datetime({ message: 'La date de début doit être au format ISO 8601' }),
  endDate: z
    .string()
    .datetime({ message: 'La date de fin doit être au format ISO 8601' }),
  includeAnnexes: z
    .boolean()
    .default(true)
    .describe('Inclure les annexes fiscales (immobilisations, amortissements)'),
  includeTVA: z
    .boolean()
    .default(true)
    .describe('Inclure les déclarations TVA'),
});

export type FiscalReportRequest = z.infer<typeof FiscalReportRequestSchema>;

/**
 * Schema pour les données de bilan comptable
 */
export const BilanSchema = z.object({
  actif: z.object({
    immobilisations: z.number().min(0),
    stocks: z.number().min(0),
    creances: z.number().min(0),
    tresorerie: z.number().min(0),
    total: z.number().min(0),
  }),
  passif: z.object({
    capitauxPropres: z.number(),
    dettes: z.number().min(0),
    total: z.number().min(0),
  }),
});

export type Bilan = z.infer<typeof BilanSchema>;

/**
 * Schema pour le compte de résultat
 */
export const CompteResultatSchema = z.object({
  produits: z.object({
    caHT: z.number().min(0).describe('Chiffre d\'affaires HT'),
    produitsFinanciers: z.number().min(0),
    autresProduits: z.number().min(0),
    total: z.number().min(0),
  }),
  charges: z.object({
    achats: z.number().min(0),
    servicesExterieurs: z.number().min(0),
    salaires: z.number().min(0),
    autresCharges: z.number().min(0),
    total: z.number().min(0),
  }),
  resultatNet: z.number().describe('Résultat net (produits - charges)'),
});

export type CompteResultat = z.infer<typeof CompteResultatSchema>;

/**
 * Schema pour les déclarations TVA
 */
export const TVADeclarationSchema = z.object({
  collectee: z.number().min(0).describe('TVA collectée sur les ventes'),
  deductible: z.number().min(0).describe('TVA déductible sur les achats'),
  nette: z.number().describe('TVA nette à payer (collectée - déductible)'),
  synthese: z.array(
    z.object({
      periode: z.string(),
      collectee: z.number().min(0),
      deductible: z.number().min(0),
      nette: z.number(),
    })
  ),
});

export type TVADeclaration = z.infer<typeof TVADeclarationSchema>;

/**
 * Schema pour les indicateurs clés
 */
export const IndicateursSchema = z.object({
  caTTC: z.number().min(0).describe('Chiffre d\'affaires TTC'),
  caHT: z.number().min(0).describe('Chiffre d\'affaires HT'),
  commissionsHT: z.number().min(0),
  tauxEchec: z.number().min(0).max(100).describe('Taux d\'échec en %'),
  tauxCroissance: z.number().describe('Taux de croissance en %'),
  nbTransactions: z.number().int().min(0),
  panierMoyen: z.number().min(0),
});

export type Indicateurs = z.infer<typeof IndicateursSchema>;

/**
 * Schema pour le rapport fiscal complet
 */
export const FiscalReportSchema = z.object({
  exercice: z.number().int(),
  dateGeneration: z.string().datetime(),
  bilan: BilanSchema,
  compteResultat: CompteResultatSchema,
  tva: TVADeclarationSchema.optional(),
  indicateurs: IndicateursSchema,
  annexes: z
    .object({
      immobilisations: z.array(
        z.object({
          designation: z.string(),
          dateAcquisition: z.string(),
          valeurOrigine: z.number().min(0),
          amortissements: z.number().min(0),
          valeurNette: z.number().min(0),
        })
      ),
      creances: z.array(
        z.object({
          client: z.string(),
          montant: z.number().min(0),
          echeance: z.string(),
          statut: z.enum(['en_cours', 'echu', 'recouvre']),
        })
      ),
      dettes: z.array(
        z.object({
          fournisseur: z.string(),
          montant: z.number().min(0),
          echeance: z.string(),
          statut: z.enum(['en_cours', 'echu', 'paye']),
        })
      ),
    })
    .optional(),
});

export type FiscalReport = z.infer<typeof FiscalReportSchema>;

/**
 * Schema pour la réponse de l'API
 */
export const FiscalReportResponseSchema = z.object({
  success: z.boolean(),
  report: FiscalReportSchema.optional(),
  error: z.string().optional(),
  pdfUrl: z.string().url().optional(),
});

export type FiscalReportResponse = z.infer<typeof FiscalReportResponseSchema>;
