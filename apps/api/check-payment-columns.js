const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPaymentColumns() {
  try {
    console.log('🔍 CHECKING PAYMENT TABLE COLUMNS...\n');

    // Check column types
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position
    `;

    console.log('Payment table columns:');
    result.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.udt_name})`);
    });

    console.log('\n🔍 CHECKING POSTGRESQL ENUM TYPES...\n');

    const enums = await prisma.$queryRaw`
      SELECT typname FROM pg_type WHERE typtype = 'e' ORDER BY typname
    `;

    console.log('PostgreSQL ENUM types:');
    enums.forEach(e => console.log(`  - ${e.typname}`));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkPaymentColumns();
