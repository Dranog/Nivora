const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixCreatorProfilesTable() {
  try {
    console.log('🔧 ADDING ALL MISSING CREATOR_PROFILES TABLE COLUMNS...\n');

    // All columns from schema.prisma CreatorProfile model
    const sqlCommands = [
      // Core fields
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text',
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "userId" TEXT UNIQUE',

      // Profile fields
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "username" TEXT UNIQUE',
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "displayName" TEXT',
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "bio" TEXT',
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "avatar" TEXT',
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "coverImage" TEXT',

      // Monetization fields
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "stripeAccountId" TEXT UNIQUE',
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "stripeOnboarded" BOOLEAN DEFAULT false',

      // Timestamps
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE creator_profiles ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP',
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

    console.log('\n🔄 Creating indexes for performance...');

    // Create indexes (ignore errors if they exist)
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "creator_profiles_username_idx" ON creator_profiles("username")',
      'CREATE INDEX IF NOT EXISTS "creator_profiles_stripeAccountId_idx" ON creator_profiles("stripeAccountId")',
    ];

    for (const sql of indexes) {
      try {
        await prisma.$executeRawUnsafe(sql);
        const indexName = sql.match(/INDEX\s+(?:IF NOT EXISTS\s+)?"?(\w+)"?/)?.[1];
        console.log(`✅ ${indexName}`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`⚠️  Index creation warning: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Creator profiles table fixed!');
    console.log('\n📋 Next: Restart the backend server to pick up changes');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCreatorProfilesTable();
