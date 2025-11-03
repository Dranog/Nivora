const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSchema() {
  try {
    console.log('🔍 Checking database schema...\n');

    // Try to query a user with all fields
    const user = await prisma.user.findFirst({
      where: { email: 'admin@oliver.com' }
    });

    if (user) {
      console.log('✅ User found:');
      console.log('- ID:', user.id);
      console.log('- Email:', user.email);
      console.log('- Username:', user.username);
      console.log('- Role:', user.role);
      console.log('- DisplayName:', user.displayName || '(null)');
      console.log('- Has passwordHash:', !!user.passwordHash);
    } else {
      console.log('❌ User admin@oliver.com NOT found in database!');
      console.log('\nAll users in database:');
      const allUsers = await prisma.user.findMany({
        select: { email: true, username: true }
      });
      console.log(allUsers);
    }

    console.log('\n✅ Schema check complete - no errors');
  } catch (error) {
    console.error('❌ Error checking schema:');
    console.error(error.message);
    if (error.meta) {
      console.error('Meta:', error.meta);
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkSchema();
