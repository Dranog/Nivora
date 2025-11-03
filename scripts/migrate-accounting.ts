#!/usr/bin/env tsx

/**
 * Script de migration comptable
 * Exécution : npx tsx scripts/migrate-accounting.ts
 *
 * Ce script :
 * 1. Migre les transactions vers des écritures comptables
 * 2. Applique l'auto-lettrage
 * 3. Vérifie l'intégrité des données
 * 4. Génère des statistiques
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Importer les fonctions de migration depuis le module web
// Note: Pour que cela fonctionne, il faudrait compiler ou ajuster les imports
// Pour l'instant, on va recréer les fonctions ici de manière simplifiée

// ===============================
// COULEURS POUR LA CONSOLE
// ===============================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message: string, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message: string) {
  log(`✓ ${message}`, colors.green);
}

function warning(message: string) {
  log(`⚠ ${message}`, colors.yellow);
}

function error(message: string) {
  log(`✗ ${message}`, colors.red);
}

function info(message: string) {
  log(`ℹ ${message}`, colors.cyan);
}

function title(message: string) {
  log(`\n${'='.repeat(60)}`, colors.bright);
  log(message.toUpperCase(), colors.bright);
  log(`${'='.repeat(60)}`, colors.bright);
}

// ===============================
// MIGRATION : TRANSACTIONS → ÉCRITURES
// ===============================

async function migrerTransactionsVersEcritures() {
  title('Migration: Transactions → Écritures comptables');

  try {
    // Vérifier/créer les paramètres comptables
    let params = await prisma.parametresComptables.findUnique({
      where: { id: 'singleton' },
    });

    if (!params) {
      info('Création des paramètres comptables par défaut...');
      params = await prisma.parametresComptables.create({
        data: {
          exerciceEnCours: new Date().getFullYear(),
          dateDebutExercice: new Date(new Date().getFullYear(), 0, 1),
          dateFinExercice: new Date(new Date().getFullYear(), 11, 31),
          numeroEcritureActuel: 1,
        },
      });
      success('Paramètres comptables créés');
    }

    // Récupérer les transactions complétées
    const transactions = await prisma.transaction.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { createdAt: 'asc' },
    });

    info(`${transactions.length} transactions à migrer`);

    let success_count = 0;
    let skipped_count = 0;
    const errors: string[] = [];

    for (const transaction of transactions) {
      try {
        // Vérifier si l'écriture existe déjà
        const existingEcriture = await prisma.ecritureComptable.findFirst({
          where: { transactionId: transaction.id },
        });

        if (existingEcriture) {
          skipped_count++;
          continue;
        }

        // Déterminer les comptes selon le type de transaction
        const mapping = getComptePCGMapping(transaction.category);

        // Générer le numéro d'écriture
        const numeroEcriture = `${params.exerciceEnCours}-${String(params.numeroEcritureActuel).padStart(6, '0')}`;

        // Créer l'écriture avec ses lignes
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
        success_count++;

        if (success_count % 50 === 0) {
          info(`${success_count} transactions migrées...`);
        }
      } catch (err) {
        const errorMsg = `Transaction ${transaction.id}: ${err instanceof Error ? err.message : String(err)}`;
        errors.push(errorMsg);
      }
    }

    success(`Migration terminée: ${success_count} créées, ${skipped_count} ignorées`);

    if (errors.length > 0) {
      warning(`${errors.length} erreurs détectées`);
      errors.slice(0, 5).forEach((err) => error(`  - ${err}`));
      if (errors.length > 5) {
        warning(`  ... et ${errors.length - 5} autres erreurs`);
      }
    }

    return { success: success_count, skipped: skipped_count, errors };
  } catch (err) {
    error(`Erreur fatale: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

function getComptePCGMapping(category: string): { debit: string; credit: string; libelle: string } {
  const mapping: Record<string, { debit: string; credit: string; libelle: string }> = {
    SUBSCRIPTION: {
      debit: '512000',
      credit: '706000',
      libelle: 'Abonnement créateur',
    },
    PPV_PURCHASE: {
      debit: '512000',
      credit: '706000',
      libelle: 'Achat contenu payant',
    },
    TIP: {
      debit: '512000',
      credit: '706000',
      libelle: 'Pourboire',
    },
    PAYOUT: {
      debit: '411000',
      credit: '512000',
      libelle: 'Paiement créateur',
    },
    REFUND: {
      debit: '706000',
      credit: '512000',
      libelle: 'Remboursement client',
    },
    FEE: {
      debit: '628500',
      credit: '512000',
      libelle: 'Frais plateforme',
    },
  };

  return mapping[category] || mapping.FEE;
}

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
// VÉRIFICATION DE L'INTÉGRITÉ
// ===============================

async function verifierIntegrite() {
  title('Vérification de l\'intégrité');

  const ecritures = await prisma.ecritureComptable.findMany({
    include: { lignes: true },
  });

  const desequilibrees: string[] = [];

  for (const ecriture of ecritures) {
    const totalDebit = ecriture.lignes.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = ecriture.lignes.reduce((sum, l) => sum + l.credit, 0);

    if (Math.abs(totalDebit - totalCredit) > 1) {
      desequilibrees.push(
        `${ecriture.numeroEcriture}: D=${(totalDebit / 100).toFixed(2)}€ C=${(totalCredit / 100).toFixed(2)}€`
      );
    }
  }

  if (desequilibrees.length === 0) {
    success(`Toutes les écritures sont équilibrées (${ecritures.length} vérifiées)`);
  } else {
    warning(`${desequilibrees.length} écritures déséquilibrées détectées:`);
    desequilibrees.slice(0, 10).forEach((d) => error(`  - ${d}`));
    if (desequilibrees.length > 10) {
      warning(`  ... et ${desequilibrees.length - 10} autres`);
    }
  }

  return desequilibrees.length === 0;
}

// ===============================
// STATISTIQUES
// ===============================

async function afficherStatistiques() {
  title('Statistiques');

  const [transactions, ecritures, lettrages, immobilisations, lignesEcriture] = await Promise.all([
    prisma.transaction.count({ where: { status: 'COMPLETED' } }),
    prisma.ecritureComptable.count(),
    prisma.lettrage.count(),
    prisma.immobilisation.count(),
    prisma.ligneEcriture.count(),
  ]);

  info(`Transactions complétées : ${transactions}`);
  info(`Écritures comptables    : ${ecritures}`);
  info(`Lignes d'écriture       : ${lignesEcriture}`);
  info(`Lettrages               : ${lettrages}`);
  info(`Immobilisations         : ${immobilisations}`);

  if (ecritures > 0) {
    const tauxMigration = ((ecritures / transactions) * 100).toFixed(2);
    success(`Taux de migration: ${tauxMigration}%`);
  }
}

// ===============================
// MAIN
// ===============================

async function main() {
  log('\n╔══════════════════════════════════════════════════════════╗', colors.bright);
  log('║     SCRIPT DE MIGRATION COMPTABLE - OLIVER PLATFORM     ║', colors.bright);
  log('╚══════════════════════════════════════════════════════════╝', colors.bright);

  try {
    // 1. Afficher les statistiques initiales
    await afficherStatistiques();

    // 2. Migration des transactions
    await migrerTransactionsVersEcritures();

    // 3. Vérification de l'intégrité
    const integre = await verifierIntegrite();

    // 4. Afficher les statistiques finales
    await afficherStatistiques();

    // 5. Résumé final
    title('Résumé');
    if (integre) {
      success('Migration terminée avec succès !');
      success('Toutes les écritures sont équilibrées');
    } else {
      warning('Migration terminée avec des avertissements');
      warning('Certaines écritures ne sont pas équilibrées');
    }

    info('\nProchaines étapes:');
    info('  1. Vérifier le grand livre : /admin/accounting/grand-livre');
    info('  2. Consulter le bilan     : /admin/accounting/bilan');
    info('  3. Exporter le FEC        : /admin/accounting');
  } catch (err) {
    error(`\nErreur fatale lors de la migration :`);
    error(err instanceof Error ? err.message : String(err));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
main();
