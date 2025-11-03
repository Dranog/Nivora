const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    console.log('Adding timestamp columns...');

    await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP');
    console.log('✅ createdAt');

    await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP');
    console.log('✅ updatedAt');

    await prisma.$executeRawUnsafe('ALTER TABLE users ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3)');
    console.log('✅ deletedAt');

    console.log('\n✅ All timestamp columns added!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
})();
