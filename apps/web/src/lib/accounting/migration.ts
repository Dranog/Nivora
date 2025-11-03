/**
 * Migration de données : Transactions → Écritures comptables + Lettrages
 * Permet de peupler la base de données comptable depuis les transactions existantes
 */

// TODO: Properly integrate with Prisma from API package
// import { PrismaClient } from '@prisma/client';
import { autoLettrage } from './lettrage';

// const prisma = new PrismaClient();

// ===============================
// TYPES
// ===============================

interface TransactionEnrichie {
  id: string;
  type: string;
  category: string;
  amount: number;
  createdAt: Date;
  userId: string;
  creatorId?: string | null;
  description?: string | null;
}

// ===============================
// MAPPAGE TYPE TRANSACTION → COMPTE PCG
// ===============================

const MAPPING_COMPTE_PCG: Record<string, { debit: string; credit: string; libelle: string }> = {
  // Revenus plateforme
  SUBSCRIPTION: {
    debit: '512000', // Banque
    credit: '706000', // Prestations de services
    libelle: 'Abonnement créateur',
  },
  PPV_PURCHASE: {
    debit: '512000', // Banque
    credit: '706000', // Prestations de services
    libelle: 'Achat contenu payant',
  },
  TIP: {
    debit: '512000', // Banque
    credit: '706000', // Prestations de services
    libelle: 'Pourboire',
  },
  // Paiements créateurs
  PAYOUT: {
    debit: '411000', // Clients (créances créateurs)
    credit: '512000', // Banque
    libelle: 'Paiement créateur',
  },
  // Remboursements
  REFUND: {
    debit: '706000', // Annulation CA
    credit: '512000', // Banque
    libelle: 'Remboursement client',
  },
  // Frais et commissions
  FEE: {
    debit: '628500', // Commissions
    credit: '512000', // Banque
    libelle: 'Frais plateforme',
  },
};

// ===============================
// MIGRATION : TRANSACTIONS → ÉCRITURES
// ===============================

/**
 * Migre les transactions vers des écritures comptables en partie double
 * @param startDate - Date de début (optionnel)
 * @param endDate - Date de fin (optionnel)
 */
export async function migrerTransactionsVersEcritures(
  startDate?: Date,
  endDate?: Date
): Promise<{ success: number; errors: string[] }> {
  // TODO: Implement when Prisma is properly integrated
  console.log('[MIGRATION] Migration disabled - Prisma not configured');
  return { success: 0, errors: ['Migration disabled - Prisma not configured in web package'] };

  /* Original implementation - commented out until Prisma is set up
  const errors: string[] = [];
  let success = 0;

  try {
    console.log('[MIGRATION] Début de la migration des transactions...');

    // Récupérer les paramètres comptables
    let params = await prisma.parametresComptables.findUnique({
      where: { id: 'singleton' },
    });

    // Créer les paramètres par défaut si nécessaire
    if (!params) {
      params = await prisma.parametresComptables.create({
        data: {
          exerciceEnCours: new Date().getFullYear(),
          dateDebutExercice: new Date(new Date().getFullYear(), 0, 1),
          dateFinExercice: new Date(new Date().getFullYear(), 11, 31),
          numeroEcritureActuel: 1,
        },
      });
      console.log('[MIGRATION] Paramètres comptables créés');
    }

    // Construire la requête avec filtres de date
    const whereClause: any = {
      status: 'COMPLETED',
    };

    if (startDate) {
      whereClause.createdAt = { ...whereClause.createdAt, gte: startDate };
    }
    if (endDate) {
      whereClause.createdAt = { ...whereClause.createdAt, lte: endDate };
    }

    // Récupérer les transactions complétées
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    console.log(`[MIGRATION] ${transactions.length} transactions à migrer`);

    for (const transaction of transactions) {
      try {
        // Vérifier si l'écriture existe déjà
        const existingEcriture = await prisma.ecritureComptable.findFirst({
          where: { transactionId: transaction.id },
        });

        if (existingEcriture) {
          console.log(`[MIGRATION] Écriture existante pour transaction ${transaction.id}, ignorée`);
          continue;
        }

        // Mapper le type de transaction vers les comptes PCG
        const mapping = MAPPING_COMPTE_PCG[transaction.category] || MAPPING_COMPTE_PCG.FEE;

        // Générer le numéro d'écriture
        const numeroEcriture = `${params.exerciceEnCours}-${String(params.numeroEcritureActuel).padStart(6, '0')}`;

        // Créer l'écriture comptable avec ses lignes
        await prisma.ecritureComptable.create({
          data: {
            numeroEcriture,
            journal: determinerJournal(transaction.category),
            dateEcriture: transaction.createdAt,
            dateComptable: transaction.createdAt,
            libelle: transaction.description || mapping.libelle,
            reference: transaction.id,
            transactionId: transaction.id,
            validated: true,
            lignes: {
              create: [
                {
                  comptePCG: mapping.debit,
                  libelleCompte: mapping.libelle,
                  debit: Math.abs(transaction.amount),
                  credit: 0,
                },
                {
                  comptePCG: mapping.credit,
                  libelleCompte: mapping.libelle,
                  debit: 0,
                  credit: Math.abs(transaction.amount),
                },
              ],
            },
          },
        });

        // Incrémenter le numéro d'écriture
        await prisma.parametresComptables.update({
          where: { id: 'singleton' },
          data: { numeroEcritureActuel: params.numeroEcritureActuel + 1 },
        });

        params.numeroEcritureActuel += 1;
        success++;

        if (success % 100 === 0) {
          console.log(`[MIGRATION] ${success} transactions migrées...`);
        }
      } catch (error) {
        const errorMsg = `Erreur transaction ${transaction.id}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(`[MIGRATION] ${errorMsg}`);
      }
    }

    console.log(`[MIGRATION] Migration terminée : ${success} succès, ${errors.length} erreurs`);
    return { success, errors };
  } catch (error) {
    console.error('[MIGRATION] Erreur fatale:', error);
    throw error;
  }
  */
}

/**
 * Détermine le journal comptable selon le type de transaction
 */
function determinerJournal(category: string): 'BANQUE' | 'VENTES' | 'ACHATS' | 'OD' {
  switch (category) {
    case 'SUBSCRIPTION':
    case 'PPV_PURCHASE':
    case 'TIP':
      return 'VENTES';
    case 'PAYOUT':
      return 'ACHATS';
    case 'REFUND':
      return 'OD';
    default:
      return 'BANQUE';
  }
}

// ===============================
// MIGRATION : AUTO-LETTRAGE
// ===============================

/**
 * Applique l'auto-lettrage sur les transactions et persiste en BDD
 */
export async function migrerAutoLettrages(): Promise<{ success: number; errors: string[] }> {
  // TODO: Implement when Prisma is properly integrated
  console.log('[AUTO-LETTRAGE] Migration disabled - Prisma not configured');
  return { success: 0, errors: ['Migration disabled - Prisma not configured in web package'] };

  /* Original implementation - commented out until Prisma is set up
  const errors: string[] = [];
  let success = 0;

  try {
    console.log('[AUTO-LETTRAGE] Début du lettrage automatique...');

    // Récupérer toutes les transactions complétées
    const transactions = await prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' },
    });

    console.log(`[AUTO-LETTRAGE] ${transactions.length} transactions à traiter`);

    // Appliquer l'algorithme d'auto-lettrage
    const lettragesCalcules = autoLettrage(
      transactions.map((t) => ({
        id: t.id,
        amount: t.amount / 100, // Convertir cents en euros
        type: t.category,
        date: t.createdAt,
        createdAt: t.createdAt,
      }))
    );

    console.log(`[AUTO-LETTRAGE] ${lettragesCalcules.length} lettrages détectés`);

    // Persister les lettrages en base de données
    for (const lettrage of lettragesCalcules) {
      try {
        // Vérifier si le lettrage existe déjà
        const existing = await prisma.lettrage.findUnique({
          where: { code: lettrage.code },
        });

        if (existing) {
          console.log(`[AUTO-LETTRAGE] Lettrage ${lettrage.code} existe déjà, ignoré`);
          continue;
        }

        // Créer le lettrage
        await prisma.lettrage.create({
          data: {
            code: lettrage.code,
            type: lettrage.type === 'auto' ? 'AUTO' : 'MANUEL',
            statut: lettrage.statut === 'lettre' ? 'LETTRE' : 'PARTIEL',
            montantTotal: Math.round(lettrage.montantTotal * 100), // Convertir en cents
            dateLettrage: lettrage.dateLettrage,
            transactions: {
              create: lettrage.transactionIds.map((txId) => ({
                transactionId: txId,
              })),
            },
          },
        });

        success++;
      } catch (error) {
        const errorMsg = `Erreur lettrage ${lettrage.code}: ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(`[AUTO-LETTRAGE] ${errorMsg}`);
      }
    }

    console.log(`[AUTO-LETTRAGE] Lettrage terminé : ${success} succès, ${errors.length} erreurs`);
    return { success, errors };
  } catch (error) {
    console.error('[AUTO-LETTRAGE] Erreur fatale:', error);
    throw error;
  }
  */
}

// ===============================
// VÉRIFICATION & STATISTIQUES
// ===============================

/**
 * Vérifie l'intégrité des écritures comptables
 * - Chaque écriture doit être équilibrée (débit = crédit)
 */
export async function verifierIntegriteEcritures(): Promise<{
  total: number;
  equilibrees: number;
  desequilibrees: string[];
}> {
  // TODO: Implement when Prisma is properly integrated
  console.log('[VERIFICATION] Verification disabled - Prisma not configured');
  return { total: 0, equilibrees: 0, desequilibrees: [] };

  /* Original implementation - commented out until Prisma is set up
  const ecritures = await prisma.ecritureComptable.findMany({
    include: { lignes: true },
  });

  const desequilibrees: string[] = [];

  for (const ecriture of ecritures) {
    const totalDebit = ecriture.lignes.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = ecriture.lignes.reduce((sum, l) => sum + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 1) {
      // Tolérance d'1 centime
      desequilibrees.push(
        `${ecriture.numeroEcriture}: D=${totalDebit} C=${totalCredit} (diff=${totalDebit - totalCredit})`
      );
    }
  }

  return {
    total: ecritures.length,
    equilibrees: ecritures.length - desequilibrees.length,
    desequilibrees,
  };
  */
}

/**
 * Retourne les statistiques de migration
 */
export async function obtenirStatistiquesMigration(): Promise<{
  transactions: number;
  ecritures: number;
  lettrages: number;
  immobilisations: number;
}> {
  // TODO: Implement when Prisma is properly integrated
  console.log('[STATS] Statistics disabled - Prisma not configured');
  return {
    transactions: 0,
    ecritures: 0,
    lettrages: 0,
    immobilisations: 0,
  };

  /* Original implementation - commented out until Prisma is set up
  const [transactions, ecritures, lettrages, immobilisations] = await Promise.all([
    prisma.transaction.count({ where: { status: 'COMPLETED' } }),
    prisma.ecritureComptable.count(),
    prisma.lettrage.count(),
    prisma.immobilisation.count(),
  ]);

  return {
    transactions,
    ecritures,
    lettrages,
    immobilisations,
  };
  */
}
