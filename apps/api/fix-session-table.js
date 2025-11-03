const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSessionTable() {
  try {
    console.log('🔧 ADDING ALL MISSING SESSION TABLE COLUMNS...\n');

    // All columns from schema.prisma Session model
    const sqlCommands = [
      // Core fields
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "userId" TEXT NOT NULL',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "token" TEXT UNIQUE',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "refreshToken" TEXT UNIQUE',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "jti" TEXT UNIQUE',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "expiresAt" TIMESTAMP(3) NOT NULL',

      // Optional tracking fields
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "ipAddress" TEXT',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "userAgent" TEXT',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "device" TEXT',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "lastActiveAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE sessions ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP',
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
      'CREATE INDEX IF NOT EXISTS "sessions_userId_idx" ON sessions("userId")',
      'CREATE INDEX IF NOT EXISTS "sessions_token_idx" ON sessions("token")',
      'CREATE INDEX IF NOT EXISTS "sessions_jti_idx" ON sessions("jti")',
      'CREATE INDEX IF NOT EXISTS "sessions_expiresAt_idx" ON sessions("expiresAt")',
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

    console.log('\n✅ Session table fixed!');
    console.log('\n📋 Next: Restart the backend server to pick up changes');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixSessionTable();
