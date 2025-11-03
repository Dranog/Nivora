/**
 * Lettrage comptable : Rapprochement automatique et manuel de transactions
 * Conforme aux pratiques comptables françaises
 */

import { z } from 'zod';

// ===============================
// SCHÉMAS ZOD
// ===============================

export const LettrageSchema = z.object({
  code: z.string(),
  transactionIds: z.array(z.string()),
  montantTotal: z.number(),
  dateLettrage: z.date(),
  type: z.enum(['auto', 'manuel']),
  statut: z.enum(['lettre', 'partiel']),
});

export type Lettrage = z.infer<typeof LettrageSchema>;

// ===============================
// GÉNÉRATION CODE LETTRAGE (A, B, C... AA, AB...)
// ===============================

/**
 * Génère un code de lettrage alphabétique
 * Index 0 -> "A", Index 25 -> "Z", Index 26 -> "AA"
 */
export function genererCodeLettrage(index: number): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  let num = index;

  do {
    code = alphabet[num % 26] + code;
    num = Math.floor(num / 26) - 1;
  } while (num >= 0);

  return code;
}

// ===============================
// AUTO-LETTRAGE
// ===============================

/**
 * Lettrage automatique basé sur :
 * - Montants identiques ou opposés
 * - Dates proches (±3 jours)
 * - Équilibre débit/crédit
 */
export function autoLettrage(transactions: any[]): Lettrage[] {
  const lettrages: Lettrage[] = [];
  const groupes = new Map<string, any[]>();

  // Grouper par montant absolu + fenêtre de 3 jours
  transactions.forEach((t) => {
    const montant = Math.abs(Math.round(t.amount * 100)) / 100; // Arrondi à 2 décimales
    const date = new Date(t.date || t.createdAt);
    const dateKey = Math.floor(date.getTime() / (3 * 24 * 60 * 60 * 1000)); // Groupes de 3 jours
    const key = `${montant}-${dateKey}`;

    if (!groupes.has(key)) {
      groupes.set(key, []);
    }
    groupes.get(key)!.push(t);
  });

  let codeIndex = 0;

  // Créer lettrages pour groupes équilibrés
  groupes.forEach((groupe) => {
    if (groupe.length >= 2) {
      const debit = groupe.filter((t) =>
        ['Payment', 'Subscription', 'Tip', 'payment', 'subscription', 'tip'].includes(t.type)
      );
      const credit = groupe.filter((t) =>
        ['Payout', 'Refund', 'payout', 'refund', 'fee'].includes(t.type)
      );

      if (debit.length > 0 && credit.length > 0) {
        const montantDebit = debit.reduce((sum, t) => sum + Math.abs(t.amount), 0);
        const montantCredit = credit.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // Équilibre avec tolérance de 1 centime
        if (Math.abs(montantDebit - montantCredit) < 0.01) {
          lettrages.push({
            code: genererCodeLettrage(codeIndex++),
            transactionIds: groupe.map((t) => t.id),
            montantTotal: montantDebit,
            dateLettrage: new Date(),
            type: 'auto',
            statut: 'lettre',
          });
        }
      }
    }
  });

  return lettrages;
}

// ===============================
// LETTRAGE MANUEL
// ===============================

/**
 * Crée un lettrage manuel pour un ensemble de transactions
 * Vérifie l'équilibre débit/crédit
 */
export function lettrerManuellement(transactionIds: string[], transactions: any[]): Lettrage {
  const transactionsALettrer = transactions.filter((t) => transactionIds.includes(t.id));

  if (transactionsALettrer.length < 2) {
    throw new Error('Minimum 2 transactions requises pour le lettrage');
  }

  const debit = transactionsALettrer
    .filter((t) => ['Payment', 'Subscription', 'Tip', 'payment', 'subscription', 'tip'].includes(t.type))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const credit = transactionsALettrer
    .filter((t) => ['Payout', 'Refund', 'payout', 'refund', 'fee'].includes(t.type))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const equilibre = Math.abs(debit - credit) < 0.01;

  return {
    code: `MAN-${Date.now().toString(36).toUpperCase()}`,
    transactionIds,
    montantTotal: Math.max(debit, credit),
    dateLettrage: new Date(),
    type: 'manuel',
    statut: equilibre ? 'lettre' : 'partiel',
  };
}

// ===============================
// BALANCE ÂGÉE
// ===============================

export interface BalanceAgee {
  total: number;
  moins30j: number;
  entre30et60j: number;
  entre60et90j: number;
  plus90j: number;
  provisions: number;
}

/**
 * Calcule la balance âgée des créances
 * Provisions : 50% des créances > 90 jours
 */
export function calculerBalanceAgee(creances: any[]): BalanceAgee {
  const now = new Date();
  let moins30j = 0;
  let entre30et60j = 0;
  let entre60et90j = 0;
  let plus90j = 0;

  creances.forEach((c) => {
    const dateCreation = new Date(c.date || c.createdAt);
    const joursRetard = Math.floor((now.getTime() - dateCreation.getTime()) / (1000 * 60 * 60 * 24));
    const montant = Math.abs(c.amount);

    if (joursRetard < 30) {
      moins30j += montant;
    } else if (joursRetard < 60) {
      entre30et60j += montant;
    } else if (joursRetard < 90) {
      entre60et90j += montant;
    } else {
      plus90j += montant;
    }
  });

  // Provisions pour créances douteuses (50% > 90j)
  const provisions = plus90j * 0.5;

  return {
    total: round(moins30j + entre30et60j + entre60et90j + plus90j),
    moins30j: round(moins30j),
    entre30et60j: round(entre30et60j),
    entre60et90j: round(entre60et90j),
    plus90j: round(plus90j),
    provisions: round(provisions),
  };
}

// ===============================
// UTILITAIRES
// ===============================

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Délettrage : Supprime un lettrage existant
 */
export function delettrer(lettrage: Lettrage): string[] {
  return lettrage.transactionIds;
}

/**
 * Vérifie si une transaction est déjà lettrée
 */
export function estLettree(transactionId: string, lettrages: Lettrage[]): boolean {
  return lettrages.some((l) => l.transactionIds.includes(transactionId));
}

/**
 * Exporte les lettrages au format CSV
 */
export function exporterLettragesCSV(lettrages: Lettrage[]): string {
  const header = 'Code;Type;Statut;Montant Total;Date Lettrage;Nb Transactions\n';
  const rows = lettrages
    .map(
      (l) =>
        `${l.code};${l.type};${l.statut};${l.montantTotal.toFixed(2)};${l.dateLettrage.toISOString().split('T')[0]};${l.transactionIds.length}`
    )
    .join('\n');

  return header + rows;
}
