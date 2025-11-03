#!/usr/bin/env tsx

/**
 * Script d'initialisation comptable - Crée les paramètres par défaut
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function initAccounting() {
  console.log('🔧 Initialisation des paramètres comptables...');

  try {
    // Créer ou mettre à jour les paramètres comptables
    const params = await prisma.parametresComptables.upsert({
      where: { id: 'singleton' },
      update: {},
      create: {
        id: 'singleton',
        exerciceEnCours: new Date().getFullYear(),
        dateDebutExercice: new Date(new Date().getFullYear(), 0, 1),
        dateFinExercice: new Date(new Date().getFullYear(), 11, 31),
        numeroEcritureActuel: 1,
        numeroJournalActuel: 1,
        compteBanque: '512000',
        compteClientCreateur: '411000',
        compteFournisseur: '401000',
        compteCA: '706000',
        compteTVACollectee: '445710',
        compteTVADeductible: '445660',
        compteCharges: '628000',
        compteCommission: '628500',
        tauxTVA: 20.0,
        tauxCommission: 20.0,
        updatedAt: new Date(),
      },
    });

    console.log('✓ Paramètres comptables créés/mis à jour');
    console.log(`  - Exercice: ${params.exerciceEnCours}`);
    console.log(`  - Compte banque: ${params.compteBanque}`);
    console.log(`  - Compte CA: ${params.compteCA}`);
    console.log(`  - TVA: ${params.tauxTVA}%`);
    console.log(`  - Commission: ${params.tauxCommission}%`);

    // Vérifier les tables
    console.log('\n📊 Vérification des tables...');

    const ecritures = await prisma.ecritureComptable.count();
    const lignes = await prisma.ligneEcriture.count();
    const lettrages = await prisma.lettrage.count();
    const immobilisations = await prisma.immobilisation.count();

    console.log(`  ✓ Écritures comptables: ${ecritures}`);
    console.log(`  ✓ Lignes d'écriture: ${lignes}`);
    console.log(`  ✓ Lettrages: ${lettrages}`);
    console.log(`  ✓ Immobilisations: ${immobilisations}`);

    console.log('\n✅ Initialisation terminée avec succès!');
    console.log('\n💡 Prochaines étapes:');
    console.log('  1. Accéder au Grand Livre: http://localhost:3001/admin/accounting/grand-livre');
    console.log('  2. Accéder au Bilan: http://localhost:3001/admin/accounting/bilan');
    console.log('  3. (Optionnel) Migrer les données: npx tsx scripts/migrate-accounting.ts');

  } catch (error) {
    console.error('✗ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

initAccounting();
