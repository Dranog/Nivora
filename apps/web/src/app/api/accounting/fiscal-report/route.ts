/**
 * API Route: Génération de Rapport Fiscal - VERSION V2 COHÉRENTE
 * Endpoint: POST /api/accounting/fiscal-report
 * @module api/accounting/fiscal-report
 */

import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { format } from 'date-fns';
import { z } from 'zod';
import type { Transaction } from '@/types/transaction';

// V2 Calculators - Guaranteed coherence
import { calculateBalanceV2, type BalanceData } from '@/lib/fiscal/balance-calculator-v2';
import { calculateResultatV2, type ResultatData } from '@/lib/fiscal/resultat-calculator-v2';
import { validateCoherence } from '@/lib/fiscal/data-harmonizer';
import { calculateRatios } from '@/lib/fiscal/ratios-calculator';
import { generateCerfa2050V2, generateCerfa2051V2 } from '@/lib/fiscal/cerfa-generator-v2';
import { calculateFluxTresorerie, addFluxTresoreriePage } from '@/lib/fiscal/flux-tresorerie-v2';

// PDF Helpers
import {
  addCoverPage,
  addBilanActifPage,
  addBilanPassifPage,
  addCompteResultatPage,
  addSIGPage,
  addComparatifPage,
  addImmobilisationsPage,
  addCreancesDettesPage,
  addTVAPage,
  addRatiosPage,
  addNotesPage,
  addPageNumbers,
} from '@/lib/fiscal/pdf-helpers';

// Nouveaux modules conformité fiscale française
import { generateAllCA3 } from '@/lib/fiscal/ca3-generator';
import {
  generateAnnexeClients,
  generateAnnexeFournisseurs,
  generateAnnexePersonnel,
  generateAnnexeImmobilisations,
} from '@/lib/fiscal/annexes-legales';
import { generateCerfaIS, generateCerfaCFE } from '@/lib/fiscal/cerfa-is-cfe';
import { generateCompteResultatStandardFrancais } from '@/lib/fiscal/compte-resultat-standard';
import { generateLegalAttestation, generateDocumentChecklist } from '@/lib/fiscal/legal-attestation';

/**
 * Schema de validation pour la requête
 */
const FiscalReportRequestSchema = z.object({
  year: z.number().int().min(2020).max(2030),
  periodType: z.enum(['full', 'custom']),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  options: z.object({
    includeAnnexes: z.boolean().default(true),
    includeTVA: z.boolean().default(true),
    includeBalance: z.boolean().default(true),
    includeResultAccount: z.boolean().default(true),
    includeCerfa: z.boolean().default(true),
    includeComparatif: z.boolean().default(true),
    includeFluxTresorerie: z.boolean().default(true),
    format: z.enum(['detailed', 'summary']).default('detailed'),
  }).optional().default({
    includeAnnexes: true,
    includeTVA: true,
    includeBalance: true,
    includeResultAccount: true,
    includeCerfa: true,
    includeComparatif: true,
    includeFluxTresorerie: true,
    format: 'detailed' as const,
  }),
});

type FiscalReportRequest = z.infer<typeof FiscalReportRequestSchema>;

/**
 * Fetch transactions from database (placeholder)
 * TODO: Replace with real database query
 */
async function fetchTransactions(year: number): Promise<Transaction[]> {
  // Placeholder: Generate mock transactions
  // In production, this should query your database
  console.log(`[fetchTransactions] Fetching transactions for year ${year}`);

  // Mock data for testing
  const mockTransactions: Transaction[] = [];

  // Generate some realistic mock data
  for (let month = 0; month < 12; month++) {
    for (let i = 0; i < 10; i++) {
      const date = new Date(year, month, Math.floor(Math.random() * 28) + 1);
      const types: Array<'subscription' | 'ppv' | 'tip' | 'marketplace'> = ['subscription', 'ppv', 'tip', 'marketplace'];
      const type = types[Math.floor(Math.random() * types.length)];

      const grossAmount = Math.floor(Math.random() * 50000) + 1000; // 10€ to 500€ in centimes
      const commission = Math.floor(grossAmount * 0.15); // 15% commission
      const vat = Math.floor(commission * 0.20); // 20% VAT

      mockTransactions.push({
        id: `tx_${year}_${month}_${i}`,
        invoiceNumber: `INV-${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(4, '0')}`,
        date,
        type,
        creator: {
          name: `Creator ${i}`,
          email: `creator${i}@example.com`,
          fiscalStatus: 'Auto-entrepreneur',
          siret: '12345678901234',
        },
        fan: {
          name: `Fan ${i}`,
          country: 'FR',
          type: 'individual',
        },
        amounts: {
          net: grossAmount - vat,
          vat,
          vatRate: 20,
          gross: grossAmount,
          commission,
          commissionVAT: vat,
          creatorNet: grossAmount - commission - vat,
        },
        status: Math.random() > 0.05 ? 'completed' : 'pending',
        reconciled: true,
      } as Transaction);
    }
  }

  return mockTransactions;
}

/**
 * POST /api/accounting/fiscal-report
 * Génère et retourne un rapport fiscal en PDF avec cohérence comptable garantie
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    console.log('🔵 Début génération rapport fiscal V2');

    // 1. VALIDATION DE LA REQUÊTE
    const body = await req.json();
    const validation = FiscalReportRequestSchema.safeParse(body);

    if (!validation.success) {
      console.error('❌ Validation error:', validation.error.format());
      return NextResponse.json(
        { error: 'Validation échouée', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { year, options } = validation.data;
    console.log(`📅 Exercice: ${year}`);

    // 2. RÉCUPÉRER LES TRANSACTIONS
    console.log('🔄 Récupération des transactions...');
    const transactions = await fetchTransactions(year);

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: 'Aucune transaction trouvée' },
        { status: 404 }
      );
    }

    console.log(`✅ ${transactions.length} transactions récupérées`);

    // 3. CALCULER BILAN (V2 = cohérent)
    console.log('🔧 Calcul du bilan...');
    const balance: BalanceData = calculateBalanceV2(transactions);
    console.log('✅ Bilan calculé:', {
      actif: balance.actif.totalActif.toFixed(2),
      passif: balance.passif.totalPassif.toFixed(2),
      resultatBilan: balance.passif.resultatExercice.toFixed(2),
      equilibre: Math.abs(balance.actif.totalActif - balance.passif.totalPassif) < 0.01 ? '✓' : '✗',
    });

    // 4. CALCULER COMPTE DE RÉSULTAT (V2 = cohérent avec bilan)
    console.log('🔧 Calcul du compte de résultat...');
    const resultat: ResultatData = calculateResultatV2(
      balance.actif.totalActif,
      balance.actif.amortissementsCumules
    );
    console.log('✅ Compte résultat calculé:', {
      ca: resultat.ca.toFixed(2),
      resultatNetCR: resultat.resultatNet.toFixed(2),
    });

    // 5. VALIDATION CRITIQUE DE LA COHÉRENCE
    console.log('🔍 Vérification cohérence avant validation...');
    console.log({
      resultatBilan: balance.passif.resultatExercice.toFixed(2),
      resultatCR: resultat.resultatNet.toFixed(2),
      ecart: Math.abs(balance.passif.resultatExercice - resultat.resultatNet).toFixed(4),
      tolerance: '0.01',
    });

    try {
      validateCoherence({
        resultatNetBilan: balance.passif.resultatExercice,
        resultatNetCompteResultat: resultat.resultatNet,
        dotationsCompteResultat: resultat.dotationsAmortissements,
        dotationsTableauImmo: resultat.dotationsAmortissements,
        totalActif: balance.actif.totalActif,
        totalPassif: balance.passif.totalPassif,
      });
      console.log('✅ Validation cohérence OK');
    } catch (error) {
      console.error('❌ Validation cohérence échouée:', (error as Error).message);
      console.error('Détails incohérence:', {
        resultatBilan: balance.passif.resultatExercice,
        resultatCR: resultat.resultatNet,
        ecartResultat: Math.abs(balance.passif.resultatExercice - resultat.resultatNet),
        ecartActifPassif: Math.abs(balance.actif.totalActif - balance.passif.totalPassif),
        dotationsCR: resultat.dotationsAmortissements,
        dotationsImmo: resultat.dotationsAmortissements,
      });
      return NextResponse.json(
        {
          error: 'Incohérence comptable détectée',
          message: (error as Error).message,
        },
        { status: 500 }
      );
    }

    // 6. CALCULER RATIOS
    console.log('🔧 Calcul des ratios...');
    const ratios = calculateRatios(balance, resultat);
    console.log('✅ Ratios calculés:', {
      roe: ratios.rentabilite.roe.toFixed(2),
      roa: ratios.rentabilite.roa.toFixed(2),
    });

    // 7. FLUX DE TRÉSORERIE
    console.log('🔧 Calcul des flux de trésorerie...');
    const fluxTresorerie = calculateFluxTresorerie(resultat, balance);
    console.log('✅ Flux de trésorerie calculés');

    // 8. GÉNÉRER LE PDF
    console.log('📄 Génération du PDF...');

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // PAGE 1: Page de garde
    addCoverPage(doc, year);
    console.log('  ✓ Page de garde');

    // PAGES 2-3: Bilan actif/passif
    if (options.includeBalance) {
      addBilanActifPage(doc, balance, year);
      addBilanPassifPage(doc, balance, year);
      console.log('  ✓ Bilan détaillé');
    }

    // PAGES 4-5: Compte de résultat (FORMAT STANDARD FRANÇAIS)
    if (options.includeResultAccount) {
      generateCompteResultatStandardFrancais(doc, resultat, year);
      addSIGPage(doc, resultat, year);
      console.log('  ✓ Compte de résultat (format standard français)');
    }

    // CERFA 2050/2051 - Formulaires officiels synchronisés
    if (options.includeCerfa) {
      generateCerfa2050V2(doc, balance, year);
      generateCerfa2051V2(doc, balance, year);
      console.log('  ✓ CERFA 2050/2051 (Bilan)');

      // CERFA IS (Impôt sur les Sociétés)
      generateCerfaIS(doc, resultat, balance, year);
      console.log('  ✓ CERFA 2065 (IS)');

      // CERFA CFE (Cotisation Foncière des Entreprises)
      generateCerfaCFE(doc, resultat, year);
      console.log('  ✓ CERFA 1447-M (CFE)');
    }

    // COMPARATIF N vs N-1
    if (options.includeComparatif) {
      addComparatifPage(doc, balance, resultat, year);
      console.log('  ✓ Comparatif N vs N-1');
    }

    // FLUX DE TRÉSORERIE
    if (options.includeFluxTresorerie) {
      addFluxTresoreriePage(doc, fluxTresorerie, year);
      console.log('  ✓ Flux de trésorerie');
    }

    // ANNEXES LÉGALES OBLIGATOIRES
    if (options.includeAnnexes) {
      // Annexes existantes
      addImmobilisationsPage(doc, balance, year);
      addCreancesDettesPage(doc, balance, year);

      // Nouvelles annexes légales détaillées
      generateAnnexeClients(doc, transactions, year);
      console.log('  ✓ Annexe Clients détaillée');

      generateAnnexeFournisseurs(doc, resultat, year);
      console.log('  ✓ Annexe Fournisseurs détaillée');

      generateAnnexePersonnel(doc, resultat, year);
      console.log('  ✓ Annexe Personnel et charges sociales');

      generateAnnexeImmobilisations(doc, balance, year);
      console.log('  ✓ Annexe Immobilisations détaillée');

      console.log('  ✓ Toutes les annexes légales');
    }

    // TVA - Déclarations CA3 complètes
    if (options.includeTVA) {
      addTVAPage(doc, transactions, resultat.ca, year);

      // Générer toutes les CA3 mensuelles + récapitulatif annuel
      generateAllCA3(doc, transactions, year);
      console.log('  ✓ TVA + CA3 mensuelles + CA3 annuelle (13 déclarations)');
    }

    // RATIOS
    addRatiosPage(doc, ratios, year);
    console.log('  ✓ Ratios financiers');

    // NOTES
    addNotesPage(doc, year);
    console.log('  ✓ Notes annexes');

    // ATTESTATION LÉGALE ET SIGNATURES
    generateLegalAttestation(doc, year, {
      name: 'OLIVER SAS',
      siret: '123 456 789 00012',
      address: '123 Avenue des Champs-Élysées, 75008 Paris',
      legalForm: 'SAS (Société par Actions Simplifiée)',
      capital: 10000000, // 100 000€ en centimes
    });
    console.log('  ✓ Attestation légale et signatures');

    // LISTE RÉCAPITULATIVE DES DOCUMENTS
    generateDocumentChecklist(doc, year);
    console.log('  ✓ Liste récapitulative des documents');

    // NUMÉROTATION DES PAGES (doit être fait à la fin)
    addPageNumbers(doc, year);
    console.log('  ✓ Numérotation des pages');

    console.log(`✅ PDF généré: ${doc.getNumberOfPages()} pages`);

    // 9. GÉNÉRER ET RETOURNER LE BLOB
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Rapport-Fiscal-${year}-${format(new Date(), 'yyyy-MM-dd')}.pdf"`,
      },
    });

  } catch (error) {
    console.error('❌ Erreur génération rapport:', error);
    return NextResponse.json(
      {
        error: 'Erreur serveur',
        message: (error as Error).message,
        stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined,
      },
      { status: 500 }
    );
  }
}
