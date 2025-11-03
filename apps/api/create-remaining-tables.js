const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createRemainingTables() {
  try {
    console.log('🔧 CREATING REMAINING MISSING TABLES...\n');

    // Create content table
    console.log('Creating content table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "content" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "contentType" TEXT NOT NULL,
        "postId" TEXT UNIQUE,
        "videoId" TEXT UNIQUE,
        "title" TEXT,
        "description" TEXT,
        "status" TEXT DEFAULT 'PENDING',
        "views" INTEGER DEFAULT 0,
        "likes" INTEGER DEFAULT 0,
        "comments" INTEGER DEFAULT 0,
        "revenue" INTEGER DEFAULT 0,
        "publishedAt" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE,
        FOREIGN KEY ("videoId") REFERENCES "videos"("id") ON DELETE CASCADE
      )
    `);
    console.log('✅ content');

    // Create payouts table
    console.log('Creating payouts table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "payouts" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "creatorId" TEXT NOT NULL,
        "amount" INTEGER NOT NULL,
        "currency" TEXT DEFAULT 'EUR',
        "fee" INTEGER,
        "feeAmount" INTEGER,
        "status" TEXT DEFAULT 'PENDING',
        "method" TEXT NOT NULL,
        "bankDetails" JSONB,
        "paypalEmail" TEXT,
        "cryptoAddress" TEXT,
        "requestedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "approvedAt" TIMESTAMP(3),
        "approvedById" TEXT,
        "rejectedAt" TIMESTAMP(3),
        "rejectionReason" TEXT,
        "processedAt" TIMESTAMP(3),
        "completedAt" TIMESTAMP(3),
        "failedAt" TIMESTAMP(3),
        "failureReason" TEXT,
        "estimatedCompletionAt" TIMESTAMP(3),
        "retryCount" INTEGER DEFAULT 0,
        "maxRetries" INTEGER DEFAULT 3,
        "nextRetryAt" TIMESTAMP(3),
        "externalId" TEXT,
        "stripeTransferId" TEXT,
        "taxFormStatus" TEXT DEFAULT 'NOT_REQUIRED',
        "notes" TEXT,
        "metadata" JSONB DEFAULT '{}'::jsonb,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("approvedById") REFERENCES "users"("id")
      )
    `);
    console.log('✅ payouts');

    // Create kyc_verifications table
    console.log('Creating kyc_verifications table...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "kyc_verifications" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE NOT NULL,
        "provider" TEXT NOT NULL,
        "externalId" TEXT,
        "status" TEXT NOT NULL,
        "level" TEXT DEFAULT 'NONE',
        "documents" JSONB DEFAULT '{}'::jsonb,
        "documentKeys" JSONB DEFAULT '{}'::jsonb,
        "personalData" JSONB DEFAULT '{}'::jsonb,
        "piiEncrypted" BOOLEAN DEFAULT true,
        "aiScores" JSONB DEFAULT '{}'::jsonb,
        "riskScore" INTEGER,
        "selfieMatchScore" INTEGER,
        "livenessResult" TEXT,
        "country" TEXT,
        "dateOfBirth" TIMESTAMP(3),
        "reviewedById" TEXT,
        "reviewedAt" TIMESTAMP(3),
        "approvedAt" TIMESTAMP(3),
        "rejectedAt" TIMESTAMP(3),
        "rejectionReason" TEXT,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "recheckAt" TIMESTAMP(3),
        "webhookEvents" JSONB DEFAULT '[]'::jsonb,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
        FOREIGN KEY ("reviewedById") REFERENCES "users"("id")
      )
    `);
    console.log('✅ kyc_verifications');

    console.log('\n🔄 Creating indexes...');

    // Create essential indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS "content_contentType_idx" ON content("contentType")',
      'CREATE INDEX IF NOT EXISTS "content_status_idx" ON content("status")',
      'CREATE INDEX IF NOT EXISTS "content_publishedAt_idx" ON content("publishedAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "content_createdAt_idx" ON content("createdAt" DESC)',
      'CREATE INDEX IF NOT EXISTS "payouts_creatorId_idx" ON payouts("creatorId")',
      'CREATE INDEX IF NOT EXISTS "payouts_status_idx" ON payouts("status")',
      'CREATE INDEX IF NOT EXISTS "kyc_verifications_userId_idx" ON kyc_verifications("userId")',
      'CREATE INDEX IF NOT EXISTS "kyc_verifications_status_idx" ON kyc_verifications("status")',
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
    console.log('\n📋 Next: Test the dashboard endpoint again');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createRemainingTables();
