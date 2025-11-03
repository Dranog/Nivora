/**
 * Export FEC (Fichier des Écritures Comptables) conforme DGFiP
 * Norme définie par l'article A47 A-1 du Livre des procédures fiscales
 * @module lib/exports/fec-exporter
 */

import { TransactionFiscale } from '@/types/transaction-fiscale';
import { format } from 'date-fns';

/**
 * Génère un fichier FEC conforme à la norme DGFiP
 * Format: texte tabulé avec pipe (|) comme séparateur
 */
export function generateFEC(transactions: TransactionFiscale[], fiscalYear: number): string {
  const lines: string[] = [];

  // Header FEC (obligatoire selon norme)
  lines.push([
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
  ].join('\t'));

  // Pour chaque transaction, générer les lignes d'écriture
  transactions.forEach((tx) => {
    const entry = tx.fiscal.accountingEntry;
    const ecritureDate = format(tx.date, 'yyyyMMdd');

    // Lignes de débit
    entry.debit.forEach((d) => {
      lines.push([
        entry.journal,
        getJournalLabel(entry.journal),
        entry.pieceNumber,
        ecritureDate,
        d.account,
        d.label,
        tx.fan.type === 'business' && tx.fan.vatNumber ? tx.fan.vatNumber : '',
        tx.fan.name,
        tx.invoiceNumber,
        ecritureDate,
        d.label,
        (d.amount / 100).toFixed(2).replace('.', ','),
        '0,00',
        '',
        '',
        ecritureDate,
        (d.amount / 100).toFixed(2).replace('.', ','),
        'EUR',
      ].join('\t'));
    });

    // Lignes de crédit
    entry.credit.forEach((c) => {
      lines.push([
        entry.journal,
        getJournalLabel(entry.journal),
        entry.pieceNumber,
        ecritureDate,
        c.account,
        c.label,
        '',
        '',
        tx.invoiceNumber,
        ecritureDate,
        c.label,
        '0,00',
        (c.amount / 100).toFixed(2).replace('.', ','),
        '',
        '',
        ecritureDate,
        (c.amount / 100).toFixed(2).replace('.', ','),
        'EUR',
      ].join('\t'));
    });
  });

  return lines.join('\n');
}

/**
 * Télécharge le fichier FEC
 */
export function downloadFEC(transactions: TransactionFiscale[], fiscalYear: number): void {
  const content = generateFEC(transactions, fiscalYear);
  const blob = new Blob(['\ufeff' + content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FEC_${fiscalYear}_${format(new Date(), 'yyyyMMdd')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Retourne le libellé d'un journal
 */
function getJournalLabel(code: string): string {
  const labels: Record<string, string> = {
    VE: 'Journal des ventes',
    AC: 'Journal des achats',
    BQ: 'Journal de banque',
  };
  return labels[code] || code;
}

/**
 * Valide la conformité d'un fichier FEC
 */
export function validateFEC(content: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  const lines = content.split('\n');

  if (lines.length < 2) {
    errors.push('Fichier vide ou incomplet');
    return { valid: false, errors };
  }

  // Vérifier le header
  const header = lines[0].split('\t');
  const requiredColumns = [
    'JournalCode',
    'JournalLib',
    'EcritureNum',
    'EcritureDate',
    'CompteNum',
    'CompteLib',
  ];

  requiredColumns.forEach((col) => {
    if (!header.includes(col)) {
      errors.push(`Colonne manquante: ${col}`);
    }
  });

  // Vérifier que chaque ligne a le bon nombre de colonnes
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length !== header.length) {
      errors.push(`Ligne ${i + 1}: nombre de colonnes incorrect`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Export Excel avec onglets multiples
 */
export function generateExcelData(transactions: TransactionFiscale[]): {
  transactions: unknown[];
  summary: unknown[];
  vat: unknown[];
} {
  return {
    transactions: transactions.map((tx) => ({
      'N° Facture': tx.invoiceNumber,
      Date: format(tx.date, 'dd/MM/yyyy'),
      Type: tx.type,
      Créateur: tx.creator.name,
      SIRET: tx.creator.siret || '',
      Fan: tx.fan.name,
      Pays: tx.fan.country,
      'Montant HT (€)': (tx.amounts.net / 100).toFixed(2),
      'TVA (€)': (tx.amounts.vat / 100).toFixed(2),
      'Taux TVA (%)': tx.amounts.vatRate,
      'Montant TTC (€)': (tx.amounts.gross / 100).toFixed(2),
      'Commission HT (€)': (tx.amounts.platformCommission / 100).toFixed(2),
      'TVA Commission (€)': (tx.amounts.platformCommissionVAT / 100).toFixed(2),
      'Net Créateur (€)': (tx.amounts.creatorNet / 100).toFixed(2),
      Statut: tx.status,
      Rapproché: tx.bankReconciliation.reconciled ? 'Oui' : 'Non',
    })),
    summary: [
      {
        Indicateur: 'Nombre de transactions',
        Valeur: transactions.length,
      },
      {
        Indicateur: 'CA Total HT',
        Valeur: (
          transactions.reduce((sum, tx) => sum + tx.amounts.net, 0) / 100
        ).toFixed(2) + ' €',
      },
      {
        Indicateur: 'TVA Collectée',
        Valeur: (
          transactions.reduce((sum, tx) => sum + tx.amounts.vat, 0) / 100
        ).toFixed(2) + ' €',
      },
      {
        Indicateur: 'Commissions HT',
        Valeur: (
          transactions.reduce((sum, tx) => sum + tx.amounts.platformCommission, 0) / 100
        ).toFixed(2) + ' €',
      },
    ],
    vat: Object.values(
      transactions.reduce((acc, tx) => {
        const rate = tx.amounts.vatRate;
        if (!acc[rate]) {
          acc[rate] = {
            'Taux TVA (%)': rate,
            'Base HT (€)': 0,
            'Montant TVA (€)': 0,
          };
        }
        acc[rate]['Base HT (€)'] += tx.amounts.net / 100;
        acc[rate]['Montant TVA (€)'] += tx.amounts.vat / 100;
        return acc;
      }, {} as Record<number, { 'Taux TVA (%)': number; 'Base HT (€)': number; 'Montant TVA (€)': number }>)
    ).map((item) => ({
      ...item,
      'Base HT (€)': item['Base HT (€)'].toFixed(2),
      'Montant TVA (€)': item['Montant TVA (€)'].toFixed(2),
    })),
  };
}
