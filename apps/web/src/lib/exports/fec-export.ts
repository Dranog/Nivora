/**
 * FEC (Fichier des Écritures Comptables) Export
 * Format standard français pour l'export comptable (norme DGFiP)
 *
 * Specification: https://bofip.impots.gouv.fr/bofip/10693-PGP.html
 */

import { format } from 'date-fns';
import type { Transaction } from '@/types/transaction';

// ============================================================================
// TYPES
// ============================================================================

interface FECLine {
  JournalCode: string;           // Code journal (VT = Ventes)
  JournalLib: string;             // Libellé journal
  EcritureNum: string;            // Numéro d'écriture (unique par facture)
  EcritureDate: string;           // Date d'écriture (format YYYYMMDD)
  CompteNum: string;              // Numéro de compte (PCG)
  CompteLib: string;              // Libellé du compte
  CompAuxNum: string;             // Compte auxiliaire (client/fournisseur)
  CompAuxLib: string;             // Libellé compte auxiliaire
  PieceRef: string;               // Référence pièce (N° facture)
  PieceDate: string;              // Date pièce (format YYYYMMDD)
  EcritureLib: string;            // Libellé écriture
  Debit: string;                  // Montant débit (centimes avec 2 décimales)
  Credit: string;                 // Montant crédit (centimes avec 2 décimales)
  EcritureLet: string;            // Lettrage (vide pour l'instant)
  DateLet: string;                // Date lettrage (vide)
  ValidDate: string;              // Date de validation (format YYYYMMDD)
  Montantdevise: string;          // Montant en devise (vide si EUR)
  Idevise: string;                // Code devise (EUR)
}

// ============================================================================
// CONSTANTS - Plan Comptable Général (PCG)
// ============================================================================

const ACCOUNTS = {
  // Comptes de produits (classe 7)
  SALES_SUBSCRIPTION: '706100',    // Prestations de services - Abonnements
  SALES_PPV: '706200',              // Prestations de services - Contenu payant
  SALES_TIP: '706300',              // Prestations de services - Pourboires
  SALES_MARKETPLACE: '706400',      // Prestations de services - Marketplace

  // Comptes de tiers (classe 4)
  CLIENTS: '411000',                // Clients
  VAT_COLLECTED: '445710',          // TVA collectée
  VAT_TO_PAY: '445200',             // TVA à décaisser

  // Comptes de charges (classe 6)
  COMMISSION: '611000',             // Commissions et courtages
  VAT_DEDUCTIBLE: '445660',         // TVA déductible

  // Comptes de trésorerie (classe 5)
  BANK: '512000',                   // Banque

  // Comptes fournisseurs
  SUPPLIERS: '401000',              // Fournisseurs (créateurs)
};

const JOURNALS = {
  SALES: { code: 'VT', label: 'Journal des Ventes' },
  BANK: { code: 'BQ', label: 'Journal de Banque' },
  VARIOUS: { code: 'OD', label: 'Opérations Diverses' },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format amount to FEC format (with 2 decimals)
 */
function formatAmount(centimes: number): string {
  return (centimes / 100).toFixed(2).replace('.', ',');
}

/**
 * Format date to FEC format (YYYYMMDD)
 */
function formatFECDate(date: Date): string {
  return format(date, 'yyyyMMdd');
}

/**
 * Escape and clean text for CSV export
 */
function cleanText(text: string): string {
  return text
    .replace(/[^\x20-\x7E]/g, '') // Remove non-ASCII
    .replace(/"/g, '""')          // Escape quotes
    .replace(/\n/g, ' ')          // Remove newlines
    .replace(/\t/g, ' ')          // Remove tabs
    .trim();
}

/**
 * Get sales account number based on transaction type
 */
function getSalesAccount(type: Transaction['type']): string {
  switch (type) {
    case 'subscription':
      return ACCOUNTS.SALES_SUBSCRIPTION;
    case 'ppv':
      return ACCOUNTS.SALES_PPV;
    case 'tip':
      return ACCOUNTS.SALES_TIP;
    case 'marketplace':
      return ACCOUNTS.SALES_MARKETPLACE;
    default:
      return ACCOUNTS.SALES_SUBSCRIPTION;
  }
}

/**
 * Get sales account label based on transaction type
 */
function getSalesAccountLabel(type: Transaction['type']): string {
  switch (type) {
    case 'subscription':
      return 'Prestations - Abonnements';
    case 'ppv':
      return 'Prestations - Contenu payant';
    case 'tip':
      return 'Prestations - Pourboires';
    case 'marketplace':
      return 'Prestations - Marketplace';
    default:
      return 'Prestations de services';
  }
}

// ============================================================================
// FEC LINE GENERATION
// ============================================================================

/**
 * Generate FEC lines for a single transaction
 * Each transaction generates multiple accounting entries (partie double)
 */
function generateFECLinesForTransaction(tx: Transaction): FECLine[] {
  const lines: FECLine[] = [];
  const ecritureNum = tx.invoiceNumber;
  const ecritureDate = formatFECDate(tx.date);
  const pieceRef = tx.invoiceNumber;
  const pieceDate = formatFECDate(tx.date);
  const validDate = formatFECDate(tx.date);

  // Client auxiliary account (first 3 chars of name + ID)
  const compAuxNum = `C${tx.fan.name.substring(0, 3).toUpperCase()}${tx.id.substring(0, 4)}`;
  const compAuxLib = cleanText(tx.fan.name);

  const ecritureLib = cleanText(`${getSalesAccountLabel(tx.type)} - ${tx.fan.name}`);

  // ============================================================================
  // LIGNE 1: Débit Client (TTC)
  // ============================================================================

  lines.push({
    JournalCode: JOURNALS.SALES.code,
    JournalLib: JOURNALS.SALES.label,
    EcritureNum: ecritureNum,
    EcritureDate: ecritureDate,
    CompteNum: ACCOUNTS.CLIENTS,
    CompteLib: 'Clients',
    CompAuxNum: compAuxNum,
    CompAuxLib: compAuxLib,
    PieceRef: pieceRef,
    PieceDate: pieceDate,
    EcritureLib: ecritureLib,
    Debit: formatAmount(tx.amounts.gross),
    Credit: '0,00',
    EcritureLet: '',
    DateLet: '',
    ValidDate: validDate,
    Montantdevise: '',
    Idevise: 'EUR',
  });

  // ============================================================================
  // LIGNE 2: Crédit Ventes (HT)
  // ============================================================================

  lines.push({
    JournalCode: JOURNALS.SALES.code,
    JournalLib: JOURNALS.SALES.label,
    EcritureNum: ecritureNum,
    EcritureDate: ecritureDate,
    CompteNum: getSalesAccount(tx.type),
    CompteLib: getSalesAccountLabel(tx.type),
    CompAuxNum: '',
    CompAuxLib: '',
    PieceRef: pieceRef,
    PieceDate: pieceDate,
    EcritureLib: ecritureLib,
    Debit: '0,00',
    Credit: formatAmount(tx.amounts.net),
    EcritureLet: '',
    DateLet: '',
    ValidDate: validDate,
    Montantdevise: '',
    Idevise: 'EUR',
  });

  // ============================================================================
  // LIGNE 3: Crédit TVA collectée (si TVA applicable)
  // ============================================================================

  if (tx.amounts.vat > 0) {
    lines.push({
      JournalCode: JOURNALS.SALES.code,
      JournalLib: JOURNALS.SALES.label,
      EcritureNum: ecritureNum,
      EcritureDate: ecritureDate,
      CompteNum: ACCOUNTS.VAT_COLLECTED,
      CompteLib: `TVA collectée ${tx.amounts.vatRate}%`,
      CompAuxNum: '',
      CompAuxLib: '',
      PieceRef: pieceRef,
      PieceDate: pieceDate,
      EcritureLib: `TVA ${tx.amounts.vatRate}% - ${ecritureLib}`,
      Debit: '0,00',
      Credit: formatAmount(tx.amounts.vat),
      EcritureLet: '',
      DateLet: '',
      ValidDate: validDate,
      Montantdevise: '',
      Idevise: 'EUR',
    });
  }

  // ============================================================================
  // LIGNE 4: Débit Banque (encaissement)
  // ============================================================================

  lines.push({
    JournalCode: JOURNALS.BANK.code,
    JournalLib: JOURNALS.BANK.label,
    EcritureNum: ecritureNum,
    EcritureDate: ecritureDate,
    CompteNum: ACCOUNTS.BANK,
    CompteLib: 'Banque',
    CompAuxNum: '',
    CompAuxLib: '',
    PieceRef: pieceRef,
    PieceDate: pieceDate,
    EcritureLib: `Encaissement ${ecritureLib}`,
    Debit: formatAmount(tx.amounts.gross),
    Credit: '0,00',
    EcritureLet: '',
    DateLet: '',
    ValidDate: validDate,
    Montantdevise: '',
    Idevise: 'EUR',
  });

  // ============================================================================
  // LIGNE 5: Crédit Client (lettrage paiement)
  // ============================================================================

  lines.push({
    JournalCode: JOURNALS.BANK.code,
    JournalLib: JOURNALS.BANK.label,
    EcritureNum: ecritureNum,
    EcritureDate: ecritureDate,
    CompteNum: ACCOUNTS.CLIENTS,
    CompteLib: 'Clients',
    CompAuxNum: compAuxNum,
    CompAuxLib: compAuxLib,
    PieceRef: pieceRef,
    PieceDate: pieceDate,
    EcritureLib: `Paiement ${ecritureLib}`,
    Debit: '0,00',
    Credit: formatAmount(tx.amounts.gross),
    EcritureLet: '',
    DateLet: '',
    ValidDate: validDate,
    Montantdevise: '',
    Idevise: 'EUR',
  });

  // ============================================================================
  // LIGNE 6: Débit Commission (charge)
  // ============================================================================

  if (tx.amounts.commission > 0) {
    lines.push({
      JournalCode: JOURNALS.VARIOUS.code,
      JournalLib: JOURNALS.VARIOUS.label,
      EcritureNum: ecritureNum,
      EcritureDate: ecritureDate,
      CompteNum: ACCOUNTS.COMMISSION,
      CompteLib: 'Commissions plateforme',
      CompAuxNum: '',
      CompAuxLib: '',
      PieceRef: pieceRef,
      PieceDate: pieceDate,
      EcritureLib: `Commission ${ecritureLib}`,
      Debit: formatAmount(tx.amounts.commission),
      Credit: '0,00',
      EcritureLet: '',
      DateLet: '',
      ValidDate: validDate,
      Montantdevise: '',
      Idevise: 'EUR',
    });
  }

  // ============================================================================
  // LIGNE 7: Débit TVA déductible sur commission
  // ============================================================================

  if (tx.amounts.commissionVAT > 0) {
    lines.push({
      JournalCode: JOURNALS.VARIOUS.code,
      JournalLib: JOURNALS.VARIOUS.label,
      EcritureNum: ecritureNum,
      EcritureDate: ecritureDate,
      CompteNum: ACCOUNTS.VAT_DEDUCTIBLE,
      CompteLib: 'TVA déductible',
      CompAuxNum: '',
      CompAuxLib: '',
      PieceRef: pieceRef,
      PieceDate: pieceDate,
      EcritureLib: `TVA commission ${ecritureLib}`,
      Debit: formatAmount(tx.amounts.commissionVAT),
      Credit: '0,00',
      EcritureLet: '',
      DateLet: '',
      ValidDate: validDate,
      Montantdevise: '',
      Idevise: 'EUR',
    });
  }

  // ============================================================================
  // LIGNE 8: Crédit Fournisseur (créateur)
  // ============================================================================

  const supplierAuxNum = `F${tx.creator.name.substring(0, 3).toUpperCase()}${tx.id.substring(0, 4)}`;
  const supplierAuxLib = cleanText(tx.creator.name);

  lines.push({
    JournalCode: JOURNALS.VARIOUS.code,
    JournalLib: JOURNALS.VARIOUS.label,
    EcritureNum: ecritureNum,
    EcritureDate: ecritureDate,
    CompteNum: ACCOUNTS.SUPPLIERS,
    CompteLib: 'Fournisseurs créateurs',
    CompAuxNum: supplierAuxNum,
    CompAuxLib: supplierAuxLib,
    PieceRef: pieceRef,
    PieceDate: pieceDate,
    EcritureLib: `Reversement créateur ${cleanText(tx.creator.name)}`,
    Debit: '0,00',
    Credit: formatAmount(tx.amounts.creatorNet),
    EcritureLet: '',
    DateLet: '',
    ValidDate: validDate,
    Montantdevise: '',
    Idevise: 'EUR',
  });

  return lines;
}

// ============================================================================
// FEC EXPORT FUNCTIONS
// ============================================================================

/**
 * Convert FEC lines to CSV format (pipe-separated as per spec)
 */
function fecLinesToCSV(lines: FECLine[]): string {
  // Header row
  const headers = [
    'JournalCode',
    'JournalLib',
    'EcritureNum',
    'EcritureDate',
    'CompteNum',
    'CompteLib',
    'CompAuxNum',
    'CompAuxLib',
    'PieceRef',
    'PieceDate',
    'EcritureLib',
    'Debit',
    'Credit',
    'EcritureLet',
    'DateLet',
    'ValidDate',
    'Montantdevise',
    'Idevise',
  ];

  const rows = [headers.join('|')];

  // Data rows
  for (const line of lines) {
    const row = [
      line.JournalCode,
      line.JournalLib,
      line.EcritureNum,
      line.EcritureDate,
      line.CompteNum,
      line.CompteLib,
      line.CompAuxNum,
      line.CompAuxLib,
      line.PieceRef,
      line.PieceDate,
      line.EcritureLib,
      line.Debit,
      line.Credit,
      line.EcritureLet,
      line.DateLet,
      line.ValidDate,
      line.Montantdevise,
      line.Idevise,
    ];
    rows.push(row.join('|'));
  }

  return rows.join('\n');
}

/**
 * Generate FEC export for a list of transactions
 */
export function generateFECExport(transactions: Transaction[]): string {
  const allLines: FECLine[] = [];

  // Generate FEC lines for each transaction
  for (const tx of transactions) {
    if (tx.status === 'completed') {
      const lines = generateFECLinesForTransaction(tx);
      allLines.push(...lines);
    }
  }

  return fecLinesToCSV(allLines);
}

/**
 * Download FEC export as CSV file
 */
export function downloadFECExport(transactions: Transaction[], filename?: string): void {
  const csvContent = generateFECExport(transactions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `FEC_${format(new Date(), 'yyyyMMdd')}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate FEC export for a single transaction (for detail page)
 */
export function generateSingleTransactionFEC(transaction: Transaction): string {
  return generateFECExport([transaction]);
}

/**
 * Download single transaction FEC
 */
export function downloadSingleTransactionFEC(transaction: Transaction): void {
  const csvContent = generateSingleTransactionFEC(transaction);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `FEC_${transaction.invoiceNumber}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
