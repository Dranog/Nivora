#!/usr/bin/env tsx

/**
 * Script pour créer des données de test comptables
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestData() {
  console.log('📝 Création de données de test...');

  try {
    // Récupérer les paramètres
    const params = await prisma.parametresComptables.findUnique({
      where: { id: 'singleton' },
    });

    if (!params) {
      throw new Error('Paramètres comptables non trouvés. Exécutez init-accounting.ts d\'abord.');
    }

    // Créer 3 écritures comptables de test
    console.log('\n💰 Création d\'écritures de test...');

    // 1. Vente (abonnement)
    const ecriture1 = await prisma.ecritureComptable.create({
      data: {
        numeroEcriture: `${params.exerciceEnCours}-000001`,
        journal: 'VENTES',
        dateEcriture: new Date('2025-01-15'),
        dateComptable: new Date('2025-01-15'),
        libelle: 'Abonnement créateur - Test',
        validated: true,
        lignes: {
          create: [
            {
              comptePCG: '512000',
              libelleCompte: 'Banque',
              debit: 4999, // 49.99€
              credit: 0,
            },
            {
              comptePCG: '706000',
              libelleCompte: 'Prestations de services',
              debit: 0,
              credit: 4999,
            },
          ],
        },
      },
    });

    console.log(`  ✓ Écriture 1: Vente abonnement (49.99€)`);

    // 2. Paiement créateur
    const ecriture2 = await prisma.ecritureComptable.create({
      data: {
        numeroEcriture: `${params.exerciceEnCours}-000002`,
        journal: 'ACHATS',
        dateEcriture: new Date('2025-01-20'),
        dateComptable: new Date('2025-01-20'),
        libelle: 'Paiement créateur - Test',
        validated: true,
        lignes: {
          create: [
            {
              comptePCG: '411000',
              libelleCompte: 'Clients (créateurs)',
              debit: 25000, // 250€
              credit: 0,
            },
            {
              comptePCG: '512000',
              libelleCompte: 'Banque',
              debit: 0,
              credit: 25000,
            },
          ],
        },
      },
    });

    console.log(`  ✓ Écriture 2: Paiement créateur (250.00€)`);

    // 3. Commission
    const ecriture3 = await prisma.ecritureComptable.create({
      data: {
        numeroEcriture: `${params.exerciceEnCours}-000003`,
        journal: 'BANQUE',
        dateEcriture: new Date('2025-01-25'),
        dateComptable: new Date('2025-01-25'),
        libelle: 'Frais de commission - Test',
        validated: true,
        lignes: {
          create: [
            {
              comptePCG: '628500',
              libelleCompte: 'Commissions',
              debit: 500, // 5€
              credit: 0,
            },
            {
              comptePCG: '512000',
              libelleCompte: 'Banque',
              debit: 0,
              credit: 500,
            },
          ],
        },
      },
    });

    console.log(`  ✓ Écriture 3: Commission (5.00€)`);

    // Créer une immobilisation de test
    console.log('\n🏢 Création d\'une immobilisation de test...');

    const immo = await prisma.immobilisation.create({
      data: {
        nature: 'MATERIEL_INFO',
        libelle: 'Serveur de production',
        dateAcquisition: new Date('2025-01-10'),
        valeurAcquisition: 150000, // 1500€
        comptePCG: '218300',
        compteAmortissement: '281830',
        dureeAmortissement: 3,
        methode: 'LINEAIRE',
        tauxAmortissement: 1 / 3,
        amortissementsCumules: 0,
        vnc: 150000,
        statut: 'EN_COURS',
      },
    });

    console.log(`  ✓ Immobilisation: ${immo.libelle} (1500.00€)`);

    // Mettre à jour le numéro d'écriture
    await prisma.parametresComptables.update({
      where: { id: 'singleton' },
      data: { numeroEcritureActuel: 4 },
    });

    // Statistiques
    console.log('\n📊 Données créées:');
    const stats = {
      ecritures: await prisma.ecritureComptable.count(),
      lignes: await prisma.ligneEcriture.count(),
      immobilisations: await prisma.immobilisation.count(),
    };

    console.log(`  - Écritures: ${stats.ecritures}`);
    console.log(`  - Lignes: ${stats.lignes}`);
    console.log(`  - Immobilisations: ${stats.immobilisations}`);

    console.log('\n✅ Données de test créées avec succès!');
    console.log('\n💡 Vous pouvez maintenant:');
    console.log('  1. Voir le Grand Livre: http://localhost:3001/admin/accounting/grand-livre');
    console.log('  2. Voir le Bilan: http://localhost:3001/admin/accounting/bilan');

  } catch (error) {
    console.error('✗ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();
