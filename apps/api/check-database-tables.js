/**
 * Check which tables actually exist in the database
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 CHECKING DATABASE TABLES');
  console.log('='.repeat(70));
  console.log('\n');

  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;

  console.log(`Found ${tables.length} tables in database:\n`);
  tables.forEach((t, i) => {
    console.log(`${i + 1}. ${t.table_name}`);
  });

  console.log('\n');
  console.log('='.repeat(70));
  console.log('Checking for specific tables needed by dashboard:\n');

  const neededTables = [
    'users',
    'creator_profiles',
    'payments',
    'subscriptions',
    'reactions',
    'tax_forms',
    'payouts',
    'posts',
    'comments',
    'boosts',
  ];

  neededTables.forEach((tableName) => {
    const exists = tables.some((t) => t.table_name === tableName);
    const status = exists ? '✅' : '❌';
    console.log(`${status} ${tableName}`);
  });

  console.log('\n');
  console.log('='.repeat(70));
  console.log('Checking Payment table structure:\n');

  try {
    const paymentColumns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'payments'
      ORDER BY ordinal_position
    `;

    if (paymentColumns.length > 0) {
      console.log('Payment table columns:');
      paymentColumns.forEach((col) => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
    } else {
      console.log('❌ Payment table does not exist');
    }
  } catch (error) {
    console.log('❌ Error checking payment table:', error.message);
  }

  console.log('\n');
  console.log('='.repeat(70));
  console.log('Checking PayoutStatus enum values:\n');

  try {
    const enumValues = await prisma.$queryRaw`
      SELECT unnest(enum_range(NULL::"PayoutStatus"))::text as value
    `;

    if (enumValues.length > 0) {
      console.log('PayoutStatus enum values:');
      enumValues.forEach((v) => {
        console.log(`  - ${v.value}`);
      });
    }
  } catch (error) {
    console.log('❌ PayoutStatus enum not found in database');
    console.log('Error:', error.message);
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
