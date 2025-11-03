const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDashboardQueries() {
  try {
    console.log('🔍 TESTING DASHBOARD QUERIES ONE BY ONE...\n');

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLast30Days = new Date(now);
    startOfLast30Days.setDate(now.getDate() - 30);

    // Test 1: User counts
    console.log('1. Testing user counts...');
    try {
      const totalUsers = await prisma.user.count();
      console.log(`   ✅ totalUsers: ${totalUsers}`);
    } catch (err) {
      console.log(`   ❌ totalUsers: ${err.message}`);
    }

    // Test 2: Verified users
    console.log('2. Testing verified users...');
    try {
      const verifiedUsers = await prisma.user.count({ where: { emailVerified: true } });
      console.log(`   ✅ verifiedUsers: ${verifiedUsers}`);
    } catch (err) {
      console.log(`   ❌ verifiedUsers: ${err.message}`);
    }

    // Test 3: Suspended users
    console.log('3. Testing suspended users...');
    try {
      const suspendedUsers = await prisma.user.count({ where: { status: 'SUSPENDED' } });
      console.log(`   ✅ suspendedUsers: ${suspendedUsers}`);
    } catch (err) {
      console.log(`   ❌ suspendedUsers: ${err.message}`);
    }

    // Test 4: Video count
    console.log('4. Testing video count...');
    try {
      const totalVideos = await prisma.video.count();
      console.log(`   ✅ totalVideos: ${totalVideos}`);
    } catch (err) {
      console.log(`   ❌ totalVideos: ${err.message}`);
    }

    // Test 5: Post count
    console.log('5. Testing post count...');
    try {
      const totalPosts = await prisma.post.count();
      console.log(`   ✅ totalPosts: ${totalPosts}`);
    } catch (err) {
      console.log(`   ❌ totalPosts: ${err.message}`);
    }

    // Test 6: Content pending moderation
    console.log('6. Testing content pending moderation...');
    try {
      const pendingContent = await prisma.content.count({ where: { status: 'PENDING' } });
      console.log(`   ✅ pendingContent: ${pendingContent}`);
    } catch (err) {
      console.log(`   ❌ pendingContent: ${err.message}`);
    }

    // Test 7: Reported content
    console.log('7. Testing reported content...');
    try {
      const reportedContent = await prisma.report.count({
        where: { status: { in: ['PENDING', 'UNDER_REVIEW'] } },
      });
      console.log(`   ✅ reportedContent: ${reportedContent}`);
    } catch (err) {
      console.log(`   ❌ reportedContent: ${err.message}`);
    }

    // Test 8: Payment aggregates
    console.log('8. Testing payment aggregates...');
    try {
      const totalRevenue = await prisma.payment.aggregate({ _sum: { amount: true } });
      console.log(`   ✅ totalRevenue: ${totalRevenue._sum.amount || 0}`);
    } catch (err) {
      console.log(`   ❌ totalRevenue: ${err.message}`);
    }

    // Test 9: Payout aggregates
    console.log('9. Testing payout aggregates...');
    try {
      const pendingPayouts = await prisma.payout.aggregate({
        where: { status: 'PENDING' },
        _sum: { amount: true },
      });
      console.log(`   ✅ pendingPayouts: ${pendingPayouts._sum.amount || 0}`);
    } catch (err) {
      console.log(`   ❌ pendingPayouts: ${err.message}`);
    }

    // Test 10: Report counts
    console.log('10. Testing report counts...');
    try {
      const totalReports = await prisma.report.count();
      console.log(`   ✅ totalReports: ${totalReports}`);
    } catch (err) {
      console.log(`   ❌ totalReports: ${err.message}`);
    }

    // Test 11: KYC counts
    console.log('11. Testing KYC counts...');
    try {
      const totalKyc = await prisma.kycVerification.count();
      console.log(`   ✅ totalKyc: ${totalKyc}`);
    } catch (err) {
      console.log(`   ❌ totalKyc: ${err.message}`);
    }

    // Test 12: User growth data (raw SQL)
    console.log('12. Testing user growth data (raw SQL)...');
    try {
      const data = await prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM "users"
        WHERE "createdAt" >= ${startOfLast30Days}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `;
      console.log(`   ✅ userGrowth: ${data.length} data points`);
    } catch (err) {
      console.log(`   ❌ userGrowth: ${err.message}`);
    }

    // Test 13: Revenue growth data (raw SQL)
    console.log('13. Testing revenue growth data (raw SQL)...');
    try {
      const data = await prisma.$queryRaw`
        SELECT DATE("createdAt") as date, SUM(amount) as sum
        FROM "payments"
        WHERE "createdAt" >= ${startOfLast30Days} AND status = 'SUCCESS'
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `;
      console.log(`   ✅ revenueGrowth: ${data.length} data points`);
    } catch (err) {
      console.log(`   ❌ revenueGrowth: ${err.message}`);
    }

    // Test 14: Reports trend data (raw SQL)
    console.log('14. Testing reports trend data (raw SQL)...');
    try {
      const data = await prisma.$queryRaw`
        SELECT DATE("createdAt") as date, COUNT(*) as count
        FROM "reports"
        WHERE "createdAt" >= ${startOfLast30Days}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `;
      console.log(`   ✅ reportsTrend: ${data.length} data points`);
    } catch (err) {
      console.log(`   ❌ reportsTrend: ${err.message}`);
    }

    // Test 15: Recent activity
    console.log('15. Testing recent activity queries...');
    try {
      const recentUsers = await prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, username: true, createdAt: true },
      });
      console.log(`   ✅ recentUsers: ${recentUsers.length} users`);
    } catch (err) {
      console.log(`   ❌ recentUsers: ${err.message}`);
    }

    console.log('\n✅ Query test complete!');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testDashboardQueries();
