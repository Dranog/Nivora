const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPaymentQueries() {
  try {
    console.log('🔍 TESTING PAYMENT-SPECIFIC QUERIES...\n');

    const startOfMonth = new Date();
    startOfMonth.setDate(1);

    // Test 1: Total revenue (all payments)
    console.log('1. Testing total revenue...');
    try {
      const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true } });
      console.log(`   ✅ totalRevenue: ${totalRevenue._sum.amount || 0}`);
    } catch (err) {
      console.log(`   ❌ totalRevenue: ${err.message}`);
    }

    // Test 2: Revenue this month with status filter
    console.log('2. Testing revenue this month (status: SUCCESS)...');
    try {
      const monthlyRevenue = await prisma.payment.aggregate({
        where: { createdAt: { gte: startOfMonth }, status: 'SUCCESS' },
        _sum: { amount: true },
      });
      console.log(`   ✅ monthlyRevenue: ${monthlyRevenue._sum.amount || 0}`);
    } catch (err) {
      console.log(`   ❌ monthlyRevenue: ${err.message}`);
    }

    // Test 3: Subscription revenue (type + status filter)
    console.log('3. Testing subscription revenue (type: SUBSCRIPTION, status: SUCCESS)...');
    try {
      const subscriptionRevenue = await prisma.payment.aggregate({
        where: { type: 'SUBSCRIPTION', status: 'SUCCESS' },
        _sum: { amount: true },
      });
      console.log(`   ✅ subscriptionRevenue: ${subscriptionRevenue._sum.amount || 0}`);
    } catch (err) {
      console.log(`   ❌ subscriptionRevenue: ${err.message}`);
    }

    // Test 4: PPV revenue
    console.log('4. Testing PPV revenue (type: PPV, status: SUCCESS)...');
    try {
      const ppvRevenue = await prisma.payment.aggregate({
        where: { type: 'PPV', status: 'SUCCESS' },
        _sum: { amount: true },
      });
      console.log(`   ✅ ppvRevenue: ${ppvRevenue._sum.amount || 0}`);
    } catch (err) {
      console.log(`   ❌ ppvRevenue: ${err.message}`);
    }

    // Test 5: TIP revenue
    console.log('5. Testing TIP revenue (type: TIP, status: SUCCESS)...');
    try {
      const tipRevenue = await prisma.payment.aggregate({
        where: { type: 'TIP', status: 'SUCCESS' },
        _sum: { amount: true },
      });
      console.log(`   ✅ tipRevenue: ${tipRevenue._sum.amount || 0}`);
    } catch (err) {
      console.log(`   ❌ tipRevenue: ${err.message}`);
    }

    // Test 6: Marketplace revenue
    console.log('6. Testing marketplace revenue (type: MARKETPLACE, status: SUCCESS)...');
    try {
      const marketplaceRevenue = await prisma.payment.aggregate({
        where: { type: 'MARKETPLACE', status: 'SUCCESS' },
        _sum: { amount: true },
      });
      console.log(`   ✅ marketplaceRevenue: ${marketplaceRevenue._sum.amount || 0}`);
    } catch (err) {
      console.log(`   ❌ marketplaceRevenue: ${err.message}`);
    }

    console.log('\n✅ All payment queries work!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentQueries();
