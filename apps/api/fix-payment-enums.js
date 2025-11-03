const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixPaymentEnums() {
  try {
    console.log('🔧 CONVERTING PAYMENT COLUMNS TO ENUMS...\n');

    // Convert payments.type to PaymentType ENUM
    console.log('1. Converting payments.type to PaymentType...');
    try {
      // Drop default first
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "payments" ALTER COLUMN "type" DROP DEFAULT
      `).catch(() => {});

      // Convert to ENUM
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "payments"
        ALTER COLUMN "type" TYPE "PaymentType"
        USING "type"::"PaymentType"
      `);
      console.log('   ✅ payments.type → PaymentType');
    } catch (err) {
      console.log(`   ❌ payments.type: ${err.message}`);
    }

    // Convert payments.status to PaymentStatus ENUM
    console.log('\n2. Converting payments.status to PaymentStatus...');
    try {
      // Drop default first
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "payments" ALTER COLUMN "status" DROP DEFAULT
      `).catch(() => {});

      // Convert to ENUM
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "payments"
        ALTER COLUMN "status" TYPE "PaymentStatus"
        USING "status"::"PaymentStatus"
      `);

      // Add default back
      await prisma.$executeRawUnsafe(`
        ALTER TABLE "payments"
        ALTER COLUMN "status" SET DEFAULT 'PENDING'::"PaymentStatus"
      `);
      console.log('   ✅ payments.status → PaymentStatus (default: PENDING)');
    } catch (err) {
      console.log(`   ❌ payments.status: ${err.message}`);
    }

    console.log('\n✅ Payment ENUM conversion complete!');
    console.log('\n📋 Verifying...');

    // Verify
    const result = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns
      WHERE table_name = 'payments' AND column_name IN ('type', 'status', 'currency')
      ORDER BY column_name
    `;

    console.log('\nPayment ENUM columns:');
    result.forEach(col => {
      const icon = col.data_type === 'USER-DEFINED' ? '✅' : '❌';
      console.log(`  ${icon} ${col.column_name}: ${col.udt_name}`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixPaymentEnums();
