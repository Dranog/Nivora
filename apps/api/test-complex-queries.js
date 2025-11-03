const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testComplexQueries() {
  try {
    console.log('🔍 TESTING COMPLEX DASHBOARD QUERIES...\n');

    // Test groupBy for reports
    console.log('1. Testing reports groupBy priority...');
    try {
      const reportsByPriority = await prisma.report.groupBy({
        by: ['priority'],
        _count: { id: true },
      });
      console.log(`   ✅ reportsByPriority:`, reportsByPriority);
    } catch (err) {
      console.log(`   ❌ reportsByPriority: ${err.message}`);
    }

    // Test recent reports with relations
    console.log('\n2. Testing recent reports with reporter relation...');
    try {
      const recentReports = await prisma.report.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          reason: true,
          priority: true,
          createdAt: true,
          reporter: { select: { username: true } },
        },
      });
      console.log(`   ✅ recentReports: ${recentReports.length} reports`);
    } catch (err) {
      console.log(`   ❌ recentReports: ${err.message}`);
    }

    // Test recent KYC with user relation
    console.log('\n3. Testing recent KYC with user relation...');
    try {
      const recentKyc = await prisma.kycVerification.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          createdAt: true,
          user: { select: { username: true } },
        },
      });
      console.log(`   ✅ recentKyc: ${recentKyc.length} KYC verifications`);
    } catch (err) {
      console.log(`   ❌ recentKyc: ${err.message}`);
    }

    // Test recent transactions with user relation
    console.log('\n4. Testing recent transactions with user relation...');
    try {
      const recentTransactions = await prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          createdAt: true,
          user: { select: { username: true } },
        },
      });
      console.log(`   ✅ recentTransactions: ${recentTransactions.length} transactions`);
    } catch (err) {
      console.log(`   ❌ recentTransactions: ${err.message}`);
    }

    console.log('\n✅ Complex query test complete!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testComplexQueries();
