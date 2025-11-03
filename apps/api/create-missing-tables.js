const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingTables() {
  try {
    console.log('🔧 CREATING MISSING TABLES...\n');

    // Create payments table
    console.log('Creating payments table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "amount" INTEGER NOT NULL DEFAULT 0,
        "currency" TEXT DEFAULT 'EUR',
        "type" TEXT NOT NULL,
        "status" TEXT DEFAULT 'PENDING',
        "paymentMethod" TEXT,
        "stripePaymentIntentId" TEXT UNIQUE,
        "stripeChargeId" TEXT,
        "processingFee" INTEGER,
        "platformFee" INTEGER,
        "netAmount" INTEGER,
        "metadata" JSONB DEFAULT '{}'::jsonb,
        "description" TEXT,
        "paidAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    console.log('✅ payments');

    // Create reports table
    console.log('Creating reports table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "reports" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "reporterId" TEXT NOT NULL,
        "targetType" TEXT NOT NULL,
        "targetId" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "description" TEXT,
        "status" TEXT DEFAULT 'PENDING',
        "priority" TEXT DEFAULT 'MEDIUM',
        "assignedToId" TEXT,
        "resolution" TEXT,
        "resolvedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    console.log('✅ reports');

    // Create videos table
    console.log('Creating videos table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "videos" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT,
        "duration" INTEGER,
        "thumbnail" TEXT,
        "url" TEXT,
        "storageKey" TEXT,
        "status" TEXT DEFAULT 'PROCESSING',
        "visibility" TEXT DEFAULT 'PUBLIC',
        "views" INTEGER DEFAULT 0,
        "likes" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    console.log('✅ videos');

    // Create posts table
    console.log('Creating posts table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "authorId" TEXT NOT NULL,
        "title" TEXT,
        "content" TEXT,
        "visibility" TEXT DEFAULT 'PUBLIC',
        "isPaid" BOOLEAN DEFAULT false,
        "price" INTEGER,
        "status" TEXT DEFAULT 'PUBLISHED',
        "views" INTEGER DEFAULT 0,
        "likes" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    console.log('✅ posts');

    console.log('\n🔄 Creating indexes...');

    // Create essential indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "payments_userId_idx" ON payments("userId")',
      'CREATE INDEX IF NOT EXISTS "payments_status_idx" ON payments("status")',
      'CREATE INDEX IF NOT EXISTS "reports_reporterId_idx" ON reports("reporterId")',
      'CREATE INDEX IF NOT EXISTS "reports_status_idx" ON reports("status")',
      'CREATE INDEX IF NOT EXISTS "videos_userId_idx" ON videos("userId")',
      'CREATE INDEX IF NOT EXISTS "posts_authorId_idx" ON posts("authorId")',
    ];

    for (const sql of indexes) {
      try {
        await prisma.$executeRawUnsafe(sql);
        const indexName = sql.match(/INDEX\s+(?:IF NOT EXISTS\s+)?"?(\w+)"?/)?.[1];
        console.log(`✅ ${indexName}`);
      } catch (err) {
        if (!err.message.includes('already exists')) {
          console.log(`⚠️  ${err.message.substring(0, 50)}`);
        }
      }
    }

    console.log('\n✅ All missing tables created!');
    console.log('\n📋 Next: Restart backend to pick up changes');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingTables();
