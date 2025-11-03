/**
 * Export FEC (Fichier des Écritures Comptables)
 * Conforme à l'article A47 A-1 du Livre des Procédures Fiscales (LPF)
 * Obligatoire depuis 2014 pour les entreprises françaises
 */

import { z } from 'zod';
import { enrichirTransaction, PCG_ACCOUNTS } from './enrichment';
import type { TransactionEnriched } from './enrichment';

// ===============================
// SCHÉMAS ZOD
// ===============================

export const LigneFECSchema = z.object({
  JournalCode: z.string().max(3),
  JournalLib: z.string().max(100),
  EcritureNum: z.string().max(20),
  EcritureDate: z.string().regex(/^\d{8}$/), // YYYYMMDD
  CompteNum: z.string().max(20),
  CompteLib: z.string().max(100),
  CompAuxNum: z.string().max(20).optional(),
  CompAuxLib: z.string().max(100).optional(),
  PieceRef: z.string().max(20),
  PieceDate: z.string().regex(/^\d{8}$/), // YYYYMMDD
  EcritureLib: z.string().max(200),
  Debit: z.string().regex(/^\d+,\d{2}$/),
  Credit: z.string().regex(/^\d+,\d{2}$/),
  EcritureLet: z.string().max(3).optional(),
  DateLet: z.string().regex(/^\d{8}$/).optional(), // YYYYMMDD
  ValidDate: z.string().regex(/^\d{8}$/), // YYYYMMDD
  Montantdevise: z.string().optional(),
  Idevise: z.string().max(3).optional(),
});

export type LigneFEC = z.infer<typeof LigneFECSchema>;

// ===============================
// CONSTANTES
// ===============================

const JOURNAUX_LIBELLES: Record<string, string> = {
  VE: 'Journal des ventes',
  AC: 'Journal des achats',
  BQ: 'Journal de banque',
  OD: 'Opérations diverses',
  AN: 'À-nouveaux',
};

// ===============================
// GÉNÉRATION FEC
// ===============================

/**
 * Génère un fichier FEC complet au format texte tabulé
 * @param transactions Transactions à inclure
 * @param siren SIREN de l'entreprise (9 chiffres)
 * @param exercice Année de l'exercice comptable
 * @returns Contenu FEC (string avec séparateurs TAB)
 */
export function genererFEC(transactions: any[], siren: string, exercice: number): string {
  console.log(`🔄 [FEC Export] Début génération FEC pour ${transactions.length} transactions`);

  // En-tête FEC (18 colonnes obligatoires)
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

  let fec = headers.join('\t') + '\n';
  console.log('✅ [FEC Export] En-tête créé');

  let successCount = 0;
  let errorCount = 0;

  // Générer les écritures pour chaque transaction
  transactions.forEach((transaction, index) => {
    try {
      const enriched = enrichirTransaction(transaction);
      const lignes = genererEcrituresFEC(enriched, index + 1);
      fec += lignes.map((ligne) => formatLigneFEC(ligne)).join('');
      successCount++;
    } catch (error) {
      errorCount++;
      console.error(`❌ [FEC Export] Erreur transaction ${transaction.id}:`, error);
      console.error('❌ [FEC Export] Transaction:', JSON.stringify(transaction, null, 2));
    }
  });

  console.log(`✅ [FEC Export] Génération terminée: ${successCount} succès, ${errorCount} erreurs`);
  console.log(`📊 [FEC Export] Taille finale: ${fec.length} caractères`);

  return fec;
}

/**
 * Génère les écritures comptables FEC pour une transaction enrichie
 */
function genererEcrituresFEC(transaction: TransactionEnriched, numeroEcriture: number): LigneFEC[] {
  const lignes: LigneFEC[] = [];

  const journal = transaction.accounting.journal;
  const journalLib = JOURNAUX_LIBELLES[journal] || journal;
  const ecritureNum = `ECR${String(numeroEcriture).padStart(8, '0')}`;
  const ecritureDate = formatDateFEC(new Date(transaction.date));
  const pieceRef = transaction.id || `TXN-${numeroEcriture}`;
  const pieceDate = ecritureDate;
  const validDate = ecritureDate;
  const ecritureLib = truncate(
    `${transaction.type} - ${transaction.accounting.libelle}`,
    200
  );

  // Générer les lignes selon les écritures de la transaction enrichie
  transaction.accounting.ecritures.forEach((ecriture) => {
    if (ecriture.debit > 0) {
      lignes.push({
        JournalCode: journal,
        JournalLib: journalLib,
        EcritureNum: ecritureNum,
        EcritureDate: ecritureDate,
        CompteNum: ecriture.compte,
        CompteLib: truncate(
          ecriture.libelle || PCG_ACCOUNTS[ecriture.compte as keyof typeof PCG_ACCOUNTS] || 'Compte',
          100
        ),
        CompAuxNum: '',
        CompAuxLib: '',
        PieceRef: pieceRef,
        PieceDate: pieceDate,
        EcritureLib: ecritureLib,
        Debit: formatMontantFEC(ecriture.debit),
        Credit: formatMontantFEC(0),
        EcritureLet: '',
        DateLet: '',
        ValidDate: validDate,
        Montantdevise: '',
        Idevise: '',
      });
    }

    if (ecriture.credit > 0) {
      lignes.push({
        JournalCode: journal,
        JournalLib: journalLib,
        EcritureNum: ecritureNum,
        EcritureDate: ecritureDate,
        CompteNum: ecriture.compte,
        CompteLib: truncate(
          ecriture.libelle || PCG_ACCOUNTS[ecriture.compte as keyof typeof PCG_ACCOUNTS] || 'Compte',
          100
        ),
        CompAuxNum: '',
        CompAuxLib: '',
        PieceRef: pieceRef,
        PieceDate: pieceDate,
        EcritureLib: ecritureLib,
        Debit: formatMontantFEC(0),
        Credit: formatMontantFEC(ecriture.credit),
        EcritureLet: '',
        DateLet: '',
        ValidDate: validDate,
        Montantdevise: '',
        Idevise: '',
      });
    }
  });

  return lignes;
}

// ===============================
// FORMATAGE
// ===============================

/**
 * Formate une ligne FEC en string tabulé
 */
function formatLigneFEC(ligne: LigneFEC): string {
  const values = [
    ligne.JournalCode,
    ligne.JournalLib,
    ligne.EcritureNum,
    ligne.EcritureDate,
    ligne.CompteNum,
    ligne.CompteLib,
    ligne.CompAuxNum || '',
    ligne.CompAuxLib || '',
    ligne.PieceRef,
    ligne.PieceDate,
    ligne.EcritureLib,
    ligne.Debit,
    ligne.Credit,
    ligne.EcritureLet || '',
    ligne.DateLet || '',
    ligne.ValidDate,
    ligne.Montantdevise || '',
    ligne.Idevise || '',
  ];

  return values.join('\t') + '\n';
}

/**
 * Formate une date au format FEC (YYYYMMDD)
 */
function formatDateFEC(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Formate un montant en centimes au format FEC (virgule décimale, 2 décimales)
 */
function formatMontantFEC(centimes: number): string {
  const euros = centimes / 100;
  return euros.toFixed(2).replace('.', ',');
}

/**
 * Tronque une string à une longueur maximale
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

// ===============================
// TÉLÉCHARGEMENT
// ===============================

/**
 * Génère et télécharge un fichier FEC depuis le navigateur
 * @param transactions Transactions à exporter
 * @param siren SIREN de l'entreprise
 * @param exercice Année de l'exercice
 */
export function telechargerFEC(transactions: any[], siren: string, exercice: number): void {
  try {
    const fecContent = genererFEC(transactions, siren, exercice);

    // Ajouter BOM UTF-8 pour compatibilité Excel
    const blob = new Blob(['\ufeff' + fecContent], {
      type: 'text/plain;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    // Nom fichier : SIRENFECAAAAMMJJhhmmss.txt
    const now = new Date();
    const timestamp =
      String(exercice) +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0') +
      String(now.getSeconds()).padStart(2, '0');

    a.download = `${siren}FEC${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erreur téléchargement FEC:', error);
    throw new Error('Impossible de générer le fichier FEC');
  }
}

// ===============================
// VALIDATION
// ===============================

/**
 * Vérifie qu'un FEC est conforme aux normes DGFiP
 */
export function validerFEC(fecContent: string): {
  valide: boolean;
  erreurs: string[];
  warnings: string[];
} {
  const erreurs: string[] = [];
  const warnings: string[] = [];

  const lignes = fecContent.split('\n').filter((l) => l.trim() !== '');

  if (lignes.length < 2) {
    erreurs.push('Le FEC doit contenir au moins une ligne d\'en-tête et une ligne de données');
  }

  // Vérifier l'en-tête
  const header = lignes[0].split('\t');
  if (header.length !== 18) {
    erreurs.push(`L'en-tête doit contenir exactement 18 colonnes (trouvé: ${header.length})`);
  }

  // Vérifier les lignes de données
  for (let i = 1; i < lignes.length; i++) {
    const colonnes = lignes[i].split('\t');
    if (colonnes.length !== 18) {
      erreurs.push(`Ligne ${i + 1}: nombre de colonnes incorrect (${colonnes.length} au lieu de 18)`);
    }

    // Vérifier les dates (format YYYYMMDD)
    if (colonnes[3] && !/^\d{8}$/.test(colonnes[3])) {
      erreurs.push(`Ligne ${i + 1}: format de date EcritureDate invalide`);
    }

    // Vérifier les montants (format européen avec virgule)
    if (colonnes[11] && !/^\d+,\d{2}$/.test(colonnes[11])) {
      warnings.push(`Ligne ${i + 1}: format de montant Debit inhabituel`);
    }
    if (colonnes[12] && !/^\d+,\d{2}$/.test(colonnes[12])) {
      warnings.push(`Ligne ${i + 1}: format de montant Credit inhabituel`);
    }
  }

  return {
    valide: erreurs.length === 0,
    erreurs,
    warnings,
  };
}

/**
 * Extrait les statistiques d'un FEC
 */
export function statsFEC(fecContent: string): {
  nbLignes: number;
  nbJournaux: number;
  nbEcritures: number;
  totalDebit: number;
  totalCredit: number;
  equilibre: boolean;
} {
  const lignes = fecContent.split('\n').filter((l) => l.trim() !== '' && !l.startsWith('JournalCode'));

  const journaux = new Set<string>();
  const ecritures = new Set<string>();
  let totalDebit = 0;
  let totalCredit = 0;

  lignes.forEach((ligne) => {
    const colonnes = ligne.split('\t');
    if (colonnes.length >= 13) {
      journaux.add(colonnes[0]);
      ecritures.add(colonnes[2]);

      // Parser les montants (format européen : virgule)
      const debit = parseFloat(colonnes[11].replace(',', '.')) || 0;
      const credit = parseFloat(colonnes[12].replace(',', '.')) || 0;

      totalDebit += debit;
      totalCredit += credit;
    }
  });

  const equilibre = Math.abs(totalDebit - totalCredit) < 0.01;

  return {
    nbLignes: lignes.length,
    nbJournaux: journaux.size,
    nbEcritures: ecritures.size,
    totalDebit: Math.round(totalDebit * 100) / 100,
    totalCredit: Math.round(totalCredit * 100) / 100,
    equilibre,
  };
}
