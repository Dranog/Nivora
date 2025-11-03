/**
 * Génération des écritures comptables selon le plan comptable français
 * @module lib/utils/accounting
 */

import { TransactionFiscale, AccountingEntry, AccountingLine } from '@/types/transaction-fiscale';

/**
 * Génère les écritures comptables pour une transaction
 * Conforme au Plan Comptable Général (PCG)
 */
export function generateAccountingEntry(tx: TransactionFiscale): AccountingEntry {
  const debit: AccountingLine[] = [];
  const credit: AccountingLine[] = [];

  // Débit : Compte client (411xxx)
  debit.push({
    account: '411000',
    label: `Client - ${tx.fan.name}`,
    amount: tx.amounts.gross,
  });

  // Crédit : Vente de services (707xxx)
  credit.push({
    account: '707000',
    label: `Ventes prestations services - ${getTypeLabel(tx.type)}`,
    amount: tx.amounts.net,
  });

  // Crédit : TVA collectée (44571)
  if (tx.amounts.vat > 0) {
    credit.push({
      account: '44571',
      label: `TVA collectée ${tx.amounts.vatRate}%`,
      amount: tx.amounts.vat,
    });
  }

  return {
    journal: 'VE',
    pieceNumber: `VE-${tx.invoiceNumber}`,
    debit,
    credit,
  };
}

/**
 * Génère les écritures pour une commission
 */
export function generateCommissionEntry(tx: TransactionFiscale): AccountingEntry {
  const debit: AccountingLine[] = [];
  const credit: AccountingLine[] = [];

  // Débit : Achats de prestations (604xxx)
  debit.push({
    account: '604000',
    label: `Achats prestations - Commission ${tx.creator.name}`,
    amount: tx.amounts.platformCommission,
  });

  // Débit : TVA déductible (44566)
  if (tx.amounts.platformCommissionVAT > 0) {
    debit.push({
      account: '44566',
      label: 'TVA déductible sur autres biens et services',
      amount: tx.amounts.platformCommissionVAT,
    });
  }

  // Crédit : Fournisseur (401xxx)
  credit.push({
    account: '401000',
    label: `Fournisseur - ${tx.creator.name}`,
    amount: tx.amounts.platformCommissionTotal,
  });

  return {
    journal: 'AC',
    pieceNumber: `AC-${tx.invoiceNumber}`,
    debit,
    credit,
  };
}

/**
 * Vérifie que les écritures sont équilibrées
 */
export function validateAccountingBalance(entry: AccountingEntry): boolean {
  const totalDebit = entry.debit.reduce((sum, line) => sum + line.amount, 0);
  const totalCredit = entry.credit.reduce((sum, line) => sum + line.amount, 0);
  return totalDebit === totalCredit;
}

/**
 * Retourne le label d'un type de transaction
 */
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    subscription: 'Abonnement',
    ppv: 'Contenu payant',
    tip: 'Pourboire',
    marketplace: 'Marketplace',
    withdrawal: 'Retrait',
    refund: 'Remboursement',
  };
  return labels[type] || type;
}

/**
 * Génère le texte du grand livre
 */
export function generateLedgerText(tx: TransactionFiscale): string {
  const entry = tx.fiscal.accountingEntry;
  let text = `Journal: ${entry.journal}\n`;
  text += `Pièce: ${entry.pieceNumber}\n`;
  text += `Date: ${tx.date.toLocaleDateString('fr-FR')}\n\n`;

  text += 'DÉBIT:\n';
  entry.debit.forEach((line) => {
    text += `  ${line.account} - ${line.label}: ${(line.amount / 100).toFixed(2)}€\n`;
  });

  text += '\nCRÉDIT:\n';
  entry.credit.forEach((line) => {
    text += `  ${line.account} - ${line.label}: ${(line.amount / 100).toFixed(2)}€\n`;
  });

  const totalDebit = entry.debit.reduce((sum, line) => sum + line.amount, 0);
  const totalCredit = entry.credit.reduce((sum, line) => sum + line.amount, 0);

  text += `\nTotal Débit: ${(totalDebit / 100).toFixed(2)}€\n`;
  text += `Total Crédit: ${(totalCredit / 100).toFixed(2)}€\n`;
  text += `Équilibré: ${totalDebit === totalCredit ? 'OUI' : 'NON'}`;

  return text;
}
