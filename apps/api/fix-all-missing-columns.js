const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllMissingColumns() {
  try {
    console.log('🔧 ADDING ALL MISSING USER TABLE COLUMNS...\n');

    // Complete list of columns from schema.prisma User model
    const sqlCommands = [
      // Profile fields (already added but checking again)
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "displayName" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "bio" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "avatar" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "coverImage" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "location" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "website" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "socialLinks" JSONB DEFAULT \'{}\'::jsonb',

      // Verification fields
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "verified" BOOLEAN DEFAULT false',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "ageVerified" BOOLEAN DEFAULT false',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "kycStatus" TEXT DEFAULT \'NOT_STARTED\'',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "kycLevel" TEXT DEFAULT \'NONE\'',

      // Security fields
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastLoginIp" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorEnabled" BOOLEAN DEFAULT false',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "twoFactorSecret" TEXT',

      // Suspension & Bans
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspended" BOOLEAN DEFAULT false',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspendedUntil" TIMESTAMP(3)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspensionReason" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspendedAt" TIMESTAMP(3)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "suspendedById" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "bannedReason" TEXT',

      // Stripe Integration
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT UNIQUE',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT UNIQUE',

      // Metadata
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT \'{}\'::jsonb',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "preferences" JSONB DEFAULT \'{}\'::jsonb',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "permissions" JSONB DEFAULT \'[]\'::jsonb',
    ];

    let addedCount = 0;
    for (const sql of sqlCommands) {
      try {
        const columnName = sql.match(/"(\w+)"/)[1];
        await prisma.$executeRawUnsafe(sql);
        console.log(`✅ ${columnName}`);
        addedCount++;
      } catch (err) {
        const columnName = sql.match(/"(\w+)"/)?.[1] || 'unknown';
        if (err.message.includes('already exists')) {
          console.log(`⏭️  ${columnName} (already exists)`);
        } else {
          console.log(`❌ ${columnName}: ${err.message}`);
        }
      }
    }

    console.log(`\n✅ Processed ${sqlCommands.length} columns (${addedCount} added)`);

    console.log('\n🔄 Now regenerating Prisma Client...');
    console.log('⚠️  If you see EPERM error, that\'s OK - just restart the backend\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllMissingColumns();
