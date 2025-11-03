const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSchema() {
  try {
    console.log('🔧 Adding displayName column to users table...');

    await prisma.$executeRawUnsafe(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS "displayName" TEXT;
    `);

    console.log('✅ displayName column added successfully!');

    // Verify it worked
    const user = await prisma.user.findFirst({
      where: { email: 'admin@oliver.com' }
    });

    console.log('\n✅ Verification - User query successful:');
    console.log('- Email:', user.email);
    console.log('- Username:', user.username);
    console.log('- DisplayName:', user.displayName || '(null - OK, just not set yet)');
    console.log('- Role:', user.role);

    console.log('\n🎉 Schema fix complete! Login should work now.');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.meta) {
      console.error('Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

fixSchema();
