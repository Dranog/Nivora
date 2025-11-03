const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixAllColumns() {
  try {
    console.log('🔧 Adding ALL missing User table columns...\n');

    // Add all User profile fields that might be missing
    const columns = [
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "displayName" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "bio" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "avatar" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "coverImage" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "location" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "website" TEXT',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "socialLinks" JSONB DEFAULT \'{}\'::jsonb',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastActivityAt" TIMESTAMP(3)',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "metadata" JSONB DEFAULT \'{}\'::jsonb',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "preferences" JSONB DEFAULT \'{}\'::jsonb',
      'ALTER TABLE users ADD COLUMN IF NOT EXISTS "permissions" JSONB DEFAULT \'[]\'::jsonb',
    ];

    for (const sql of columns) {
      console.log('Executing:', sql.substring(0, 60) + '...');
      await prisma.$executeRawUnsafe(sql);
    }

    console.log('\n✅ All columns added successfully!');

    // Regenerate Prisma Client to pick up the changes
    console.log('\n🔄 Regenerating Prisma Client...');
    const { execSync } = require('child_process');
    execSync('npx prisma generate', { cwd: __dirname, stdio: 'inherit' });

    console.log('\n🎉 Schema fix complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Try logging in again at http://localhost:3000/admin/login');
    console.log('2. Credentials: admin@oliver.com / Admin123!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixAllColumns();
