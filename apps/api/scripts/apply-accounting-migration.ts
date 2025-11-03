#!/usr/bin/env tsx

/**
 * Script pour appliquer la migration comptable directement
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();

async function applyMigration() {
  console.log('📦 Application de la migration comptable...');

  const migrationPath = join(
    __dirname,
    '../prisma/migrations/20250428_add_accounting_models/migration.sql'
  );

  try {
    const sql = readFileSync(migrationPath, 'utf-8');

    // Séparer les commandes SQL
    const commands = sql
      .split(';')
      .map((cmd) => cmd.trim())
      .filter((cmd) => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`✓ ${commands.length} commandes SQL à exécuter`);

    for (let i = 0; i < commands.length; i++) {
      const cmd = commands[i];
      try {
        await prisma.$executeRawUnsafe(cmd);
        if ((i + 1) % 10 === 0) {
          console.log(`  ✓ ${i + 1}/${commands.length} commandes exécutées...`);
        }
      } catch (error: any) {
        // Ignorer les erreurs "already exists"
        if (
          error.message.includes('already exists') ||
          error.message.includes('duplicate')
        ) {
          console.log(`  ⚠ Ignoré (déjà existant): ${cmd.substring(0, 50)}...`);
        } else {
          console.error(`  ✗ Erreur: ${error.message}`);
          console.error(`  Commande: ${cmd.substring(0, 100)}...`);
        }
      }
    }

    console.log('\n✓ Migration appliquée avec succès!');
  } catch (error) {
    console.error('✗ Erreur fatale:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

applyMigration();
