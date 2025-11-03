const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTables() {
  try {
    console.log('🔍 CHECKING ALL DATABASE TABLES...\n');

    const tables = [
      'users', 'sessions', 'creator_profiles',
      'payments', 'reports', 'videos', 'posts',
      'content', 'payouts', 'kyc_verifications'
    ];

    for (const table of tables) {
      try {
        const result = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM "${table}" LIMIT 1`);
        console.log(`✅ ${table} - EXISTS (${result[0].count} rows)`);
      } catch (err) {
        if (err.message.includes('does not exist')) {
          console.log(`❌ ${table} - MISSING`);
        } else {
          console.log(`⚠️  ${table} - ERROR: ${err.message}`);
        }
      }
    }

    console.log('\n✅ Table check complete');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTables();
