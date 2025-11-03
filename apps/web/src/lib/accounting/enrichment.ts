/**
 * Enrichissement comptable des transactions
 * Ajoute PCG, TVA, journaux sans modifier l'existant
 */

import { z } from 'zod';

// ===============================
// PLAN COMPTABLE GÉNÉRAL SIMPLIFIÉ
// ===============================
export const PCG_ACCOUNTS = {
  // Classe 1 - Capitaux
  '101000': 'Capital social',
  '120000': 'Résultat de l\'exercice',

  // Classe 2 - Immobilisations
  '205000': 'Logiciels',
  '218000': 'Matériel informatique',

  // Classe 4 - Tiers
  '411000': 'Clients - Ventes',
  '445710': 'TVA collectée',
  '445660': 'TVA déductible',
  '421000': 'Personnel - Rémunérations dues',
  '431000': 'Sécurité sociale',
  '467000': 'Autres créditeurs',
  '401000': 'Fournisseurs',

  // Classe 5 - Financier
  '512000': 'Banque',
  '530000': 'Caisse',

  // Classe 6 - Charges
  '606400': 'Fournitures administratives',
  '615000': 'Entretien et réparations',
  '622600': 'Honoraires',
  '626000': 'Frais postaux',
  '641000': 'Rémunérations du personnel',
  '645000': 'Charges de sécurité sociale',
  '627000': 'Services bancaires',

  // Classe 7 - Produits
  '706000': 'Prestations de services',
  '707000': 'Ventes de marchandises',
  '708000': 'Produits des activités annexes',
  '771000': 'Produits exceptionnels',
} as const;

export type PCGAccount = keyof typeof PCG_ACCOUNTS;

// ===============================
// CODES JOURNAUX
// ===============================
export const JOURNAL_CODES = {
  VE: 'Ventes',
  AC: 'Achats',
  BQ: 'Banque',
  OD: 'Opérations Diverses',
  AN: 'À Nouveaux',
} as const;

export type JournalCode = keyof typeof JOURNAL_CODES;

// ===============================
// TAUX TVA (France)
// ===============================
export const TVA_RATES = {
  NORMAL: 20.0,
  INTERMEDIAIRE: 10.0,
  REDUIT: 5.5,
  SUPER_REDUIT: 2.1,
  ZERO: 0.0,
} as const;

// ===============================
// SCHÉMAS ZOD
// ===============================
export const TransactionEnrichedSchema = z.object({
  // Données originales
  id: z.string(),
  type: z.enum(['Payment', 'Payout', 'Refund', 'Subscription', 'Tip']),
  amount: z.number(),
  fee: z.number(),
  net: z.number(),
  currency: z.string(),
  status: z.enum(['Completed', 'Pending', 'Failed', 'Processing']),
  date: z.string(),

  // Enrichissement comptable
  accounting: z.object({
    journal: z.enum(['VE', 'AC', 'BQ', 'OD', 'AN']),
    compteDebit: z.string(),
    compteCredit: z.string(),
    libelle: z.string(),

    // TVA
    tva: z.object({
      taux: z.number(),
      baseHT: z.number(),
      montantTVA: z.number(),
      montantTTC: z.number(),
      collectee: z.boolean(),
      deductible: z.boolean(),
    }),

    // Écritures comptables
    ecritures: z.array(z.object({
      compte: z.string(),
      libelle: z.string(),
      debit: z.number(),
      credit: z.number(),
    })),
  }),
});

export type TransactionEnriched = z.infer<typeof TransactionEnrichedSchema>;

// ===============================
// RÈGLES D'ENRICHISSEMENT
// ===============================

/**
 * Détermine le journal comptable selon le type de transaction
 */
function determinerJournal(type: string): JournalCode {
  switch (type) {
    case 'Payment':
    case 'Subscription':
    case 'Tip':
      return 'VE'; // Journal des ventes
    case 'Payout':
      return 'BQ'; // Journal de banque
    case 'Refund':
      return 'OD'; // Opérations diverses
    default:
      return 'OD';
  }
}

/**
 * Calcule le taux de TVA applicable (logique simplifiée)
 */
function calculerTauxTVA(type: string): number {
  // Services numériques : TVA normale 20%
  if (type === 'Payment' || type === 'Subscription' || type === 'Tip') {
    return TVA_RATES.NORMAL;
  }
  return TVA_RATES.ZERO;
}

/**
 * Détermine les comptes PCG selon le type et journal
 */
function determinerComptes(type: string, journal: JournalCode): { debit: PCGAccount; credit: PCGAccount } {
  switch (journal) {
    case 'VE':
      // Ventes : Débit 411 (Clients), Crédit 706 (Prestations)
      return { debit: '411000', credit: '706000' };
    case 'BQ':
      // Payout : Débit 467 (Créditeurs), Crédit 512 (Banque)
      return { debit: '467000', credit: '512000' };
    case 'OD':
      // Remboursement : Débit 706 (annulation), Crédit 411 (Clients)
      return { debit: '706000', credit: '411000' };
    default:
      return { debit: '512000', credit: '512000' };
  }
}

/**
 * Génère les écritures comptables détaillées
 */
function genererEcritures(
  type: string,
  amount: number,
  fee: number,
  tva: { baseHT: number; montantTVA: number; montantTTC: number }
): Array<{ compte: string; libelle: string; debit: number; credit: number }> {
  const ecritures: Array<{ compte: string; libelle: string; debit: number; credit: number }> = [];

  if (type === 'Payment' || type === 'Subscription' || type === 'Tip') {
    // Vente TTC
    ecritures.push({
      compte: '411000',
      libelle: 'Client - Vente',
      debit: tva.montantTTC,
      credit: 0,
    });

    // Produit HT
    ecritures.push({
      compte: '706000',
      libelle: 'Prestation de services',
      debit: 0,
      credit: tva.baseHT,
    });

    // TVA collectée
    if (tva.montantTVA > 0) {
      ecritures.push({
        compte: '445710',
        libelle: 'TVA collectée',
        debit: 0,
        credit: tva.montantTVA,
      });
    }

    // Frais bancaires
    if (fee > 0) {
      ecritures.push({
        compte: '627000',
        libelle: 'Frais bancaires',
        debit: fee,
        credit: 0,
      });
      ecritures.push({
        compte: '512000',
        libelle: 'Banque',
        debit: 0,
        credit: fee,
      });
    }
  } else if (type === 'Payout') {
    // Paiement créateur
    ecritures.push({
      compte: '467000',
      libelle: 'Créditeurs divers',
      debit: amount,
      credit: 0,
    });
    ecritures.push({
      compte: '512000',
      libelle: 'Banque - Sortie',
      debit: 0,
      credit: amount,
    });
  } else if (type === 'Refund') {
    // Remboursement (annulation vente)
    ecritures.push({
      compte: '706000',
      libelle: 'Annulation vente',
      debit: tva.baseHT,
      credit: 0,
    });
    if (tva.montantTVA > 0) {
      ecritures.push({
        compte: '445710',
        libelle: 'Annulation TVA collectée',
        debit: tva.montantTVA,
        credit: 0,
      });
    }
    ecritures.push({
      compte: '411000',
      libelle: 'Client - Remboursement',
      debit: 0,
      credit: tva.montantTTC,
    });
  }

  return ecritures;
}

// ===============================
// FONCTION PRINCIPALE D'ENRICHISSEMENT
// ===============================

/**
 * Enrichit une transaction avec données comptables complètes
 * @param transaction Transaction originale
 * @returns Transaction enrichie avec PCG, TVA, écritures
 */
export function enrichirTransaction(transaction: any): TransactionEnriched {
  try {
    const journal = determinerJournal(transaction.type);
    const tauxTVA = calculerTauxTVA(transaction.type);
    const comptes = determinerComptes(transaction.type, journal);

    // Calculs TVA (montants en centimes)
    const montantTTC = Math.abs(transaction.amount);
    const baseHT = Math.round(montantTTC / (1 + tauxTVA / 100));
    const montantTVA = montantTTC - baseHT;

    const tva = {
      taux: tauxTVA,
      baseHT,
      montantTVA,
      montantTTC,
      collectee: journal === 'VE',
      deductible: journal === 'AC',
    };

    const ecritures = genererEcritures(transaction.type, transaction.amount, transaction.fee, tva);

    return {
      ...transaction,
      accounting: {
        journal,
        compteDebit: comptes.debit,
        compteCredit: comptes.credit,
        libelle: `${JOURNAL_CODES[journal]} - ${transaction.type}`,
        tva,
        ecritures,
      },
    };
  } catch (error) {
    // Fallback sécurisé
    console.error('Erreur enrichissement transaction:', error);
    return {
      ...transaction,
      accounting: {
        journal: 'OD',
        compteDebit: '512000',
        compteCredit: '512000',
        libelle: 'Erreur enrichissement',
        tva: {
          taux: 0,
          baseHT: 0,
          montantTVA: 0,
          montantTTC: 0,
          collectee: false,
          deductible: false,
        },
        ecritures: [],
      },
    };
  }
}

/**
 * Enrichit un tableau de transactions
 */
export function enrichirTransactions(transactions: any[]): TransactionEnriched[] {
  return transactions.map(enrichirTransaction);
}

// ===============================
// STATISTIQUES COMPTABLES
// ===============================

export interface StatsComptables {
  totalHT: number;
  totalTVA: number;
  totalTTC: number;
  tvaCollectee: number;
  tvaDeductible: number;
  tvaADecaisser: number;

  parJournal: Record<JournalCode, number>;
  parCompte: Record<string, number>;
  topComptes: Array<{ compte: string; libelle: string; montant: number }>;

  alertes: Array<{ type: 'warning' | 'error' | 'info'; message: string }>;
}

/**
 * Calcule les statistiques comptables depuis transactions enrichies
 */
export function calculerStatsComptables(transactions: TransactionEnriched[]): StatsComptables {
  const parJournal: Record<JournalCode, number> = { VE: 0, AC: 0, BQ: 0, OD: 0, AN: 0 };
  const parCompte: Record<string, number> = {};

  let totalHT = 0;
  let totalTVA = 0;
  let tvaCollectee = 0;
  let tvaDeductible = 0;

  transactions
    .filter(t => t.status === 'Completed')
    .forEach(t => {
      // Agrégation par journal
      parJournal[t.accounting.journal] += t.accounting.tva.montantTTC;

      // Agrégation TVA
      totalHT += t.accounting.tva.baseHT;
      totalTVA += t.accounting.tva.montantTVA;

      if (t.accounting.tva.collectee) {
        tvaCollectee += t.accounting.tva.montantTVA;
      }
      if (t.accounting.tva.deductible) {
        tvaDeductible += t.accounting.tva.montantTVA;
      }

      // Agrégation par compte
      t.accounting.ecritures.forEach(e => {
        if (!parCompte[e.compte]) parCompte[e.compte] = 0;
        parCompte[e.compte] += (e.debit || 0) + (e.credit || 0);
      });
    });

  const totalTTC = totalHT + totalTVA;
  const tvaADecaisser = tvaCollectee - tvaDeductible;

  // Top 5 comptes
  const topComptes = Object.entries(parCompte)
    .map(([compte, montant]) => ({
      compte,
      libelle: PCG_ACCOUNTS[compte as PCGAccount] || 'Compte inconnu',
      montant,
    }))
    .sort((a, b) => b.montant - a.montant)
    .slice(0, 5);

  // Alertes
  const alertes: Array<{ type: 'warning' | 'error' | 'info'; message: string }> = [];

  if (tvaADecaisser > 100000) { // > 1000 EUR
    alertes.push({
      type: 'warning',
      message: `TVA à décaisser élevée : ${(tvaADecaisser / 100).toFixed(2)} EUR`,
    });
  }

  if (parJournal.VE === 0 && transactions.length > 0) {
    alertes.push({
      type: 'info',
      message: 'Aucune vente enregistrée dans le journal VE',
    });
  }

  return {
    totalHT,
    totalTVA,
    totalTTC,
    tvaCollectee,
    tvaDeductible,
    tvaADecaisser,
    parJournal,
    parCompte,
    topComptes,
    alertes,
  };
}
