const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixEnumTypes() {
  try {
    console.log('🔧 CREATING POSTGRESQL ENUM TYPES...\n');

    // Step 1: Create all enum types
    console.log('Creating enum types...');

    const enums = [
      {
        name: 'UserStatus',
        values: ['ACTIVE', 'SUSPENDED', 'BANNED', 'PENDING_VERIFICATION', 'DELETED']
      },
      {
        name: 'ModerationStatus',
        values: ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'FLAGGED']
      },
      {
        name: 'ReportStatus',
        values: ['PENDING', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED', 'ESCALATED']
      },
      {
        name: 'PayoutStatus',
        values: ['PENDING', 'APPROVED', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REJECTED']
      },
      {
        name: 'PayoutMethod',
        values: ['BANK_TRANSFER', 'PAYPAL', 'CRYPTO', 'STRIPE']
      },
      {
        name: 'ContentType',
        values: ['POST', 'VIDEO', 'STORY', 'LIVE', 'MESSAGE', 'PRODUCT']
      },
      {
        name: 'ReportPriority',
        values: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
      },
      {
        name: 'KycStatus',
        values: ['PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', 'UNDER_REVIEW']
      },
      {
        name: 'KycProvider',
        values: ['MANUAL', 'STRIPE', 'SUMSUB', 'ONFIDO']
      },
      {
        name: 'KycLevel',
        values: ['NONE', 'BASIC', 'ADVANCED', 'FULL']
      },
      {
        name: 'TaxFormStatus',
        values: ['NOT_REQUIRED', 'REQUIRED', 'SUBMITTED', 'APPROVED', 'REJECTED']
      },
      {
        name: 'Currency',
        values: ['EUR', 'USD', 'GBP', 'CAD']
      }
    ];

    for (const enumDef of enums) {
      try {
        const values = enumDef.values.map(v => `'${v}'`).join(', ');
        await prisma.$executeRawUnsafe(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumDef.name}') THEN
              CREATE TYPE "${enumDef.name}" AS ENUM (${values});
            END IF;
          END$$;
        `);
        console.log(`✅ ${enumDef.name}`);
      } catch (err) {
        console.log(`⚠️  ${enumDef.name}: ${err.message.substring(0, 60)}`);
      }
    }

    console.log('\n🔄 Converting TEXT columns to ENUMs...');

    // Step 2: Convert TEXT columns to use ENUM types
    const conversions = [
      { table: 'users', column: 'status', enumType: 'UserStatus', default: 'ACTIVE' },
      { table: 'content', column: 'status', enumType: 'ModerationStatus', default: 'PENDING' },
      { table: 'content', column: 'contentType', enumType: 'ContentType', default: null },
      { table: 'reports', column: 'status', enumType: 'ReportStatus', default: 'PENDING' },
      { table: 'reports', column: 'priority', enumType: 'ReportPriority', default: 'MEDIUM' },
      { table: 'payouts', column: 'status', enumType: 'PayoutStatus', default: 'PENDING' },
      { table: 'payouts', column: 'method', enumType: 'PayoutMethod', default: null },
      { table: 'payouts', column: 'currency', enumType: 'Currency', default: 'EUR' },
      { table: 'payouts', column: 'taxFormStatus', enumType: 'TaxFormStatus', default: 'NOT_REQUIRED' },
      { table: 'payments', column: 'currency', enumType: 'Currency', default: 'EUR' },
      { table: 'kyc_verifications', column: 'status', enumType: 'KycStatus', default: null },
      { table: 'kyc_verifications', column: 'provider', enumType: 'KycProvider', default: null },
      { table: 'kyc_verifications', column: 'level', enumType: 'KycLevel', default: 'NONE' },
    ];

    for (const conv of conversions) {
      try {
        // Drop default first if exists
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "${conv.table}" ALTER COLUMN "${conv.column}" DROP DEFAULT
        `).catch(() => {}); // Ignore error if no default exists

        // Convert column to enum using CAST
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "${conv.table}"
          ALTER COLUMN "${conv.column}" TYPE "${conv.enumType}"
          USING "${conv.column}"::"${conv.enumType}"
        `);

        // Add default back if needed
        if (conv.default) {
          await prisma.$executeRawUnsafe(`
            ALTER TABLE "${conv.table}"
            ALTER COLUMN "${conv.column}" SET DEFAULT '${conv.default}'::"${conv.enumType}"
          `);
        }

        console.log(`✅ ${conv.table}.${conv.column} → ${conv.enumType}`);
      } catch (err) {
        console.log(`❌ ${conv.table}.${conv.column}: ${err.message.substring(0, 80)}`);
      }
    }

    console.log('\n✅ ENUM types fixed!');
    console.log('\n📋 Next: Restart backend and test dashboard again');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

fixEnumTypes();
