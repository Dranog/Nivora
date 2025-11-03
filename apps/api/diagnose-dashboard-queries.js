/**
 * Diagnostic script to test dashboard queries directly
 * Run with: node diagnose-dashboard-queries.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testTopCreators() {
  console.log('\n1️⃣ Testing Top Creators Query...');
  try {
    const topCreators = await prisma.$queryRaw`
      SELECT
        u.id,
        u.username,
        cp."displayName" as "displayName",
        u.avatar,
        COALESCE(SUM(p.amount), 0) as revenue,
        (SELECT COUNT(*) FROM "subscriptions" s WHERE s."creatorId" = u.id AND s.status = 'ACTIVE') as subscribers,
        (SELECT COUNT(*) FROM "posts" po WHERE po."authorId" = u.id) as "postsCount"
      FROM "users" u
      INNER JOIN "creator_profiles" cp ON cp."userId" = u.id
      LEFT JOIN "payments" p ON p."creatorId" = u.id AND p.status = 'SUCCESS'
      GROUP BY u.id, cp."displayName"
      ORDER BY revenue DESC
      LIMIT 5
    `;
    console.log('✅ Top Creators Query Success:', topCreators.length, 'results');
  } catch (error) {
    console.log('❌ Top Creators Query Failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
  }
}

async function testEngagement() {
  console.log('\n2️⃣ Testing Engagement Query...');
  try {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const currentWeekMetrics = await prisma.$queryRaw`
      SELECT type::text, COUNT(*) as count
      FROM "reactions"
      WHERE "createdAt" >= ${last7Days}
      GROUP BY type
    `;
    console.log('✅ Engagement Query Success:', currentWeekMetrics.length, 'results');
  } catch (error) {
    console.log('❌ Engagement Query Failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
  }
}

async function testGeography() {
  console.log('\n3️⃣ Testing Geography Query...');
  try {
    const data = await prisma.$queryRaw`
      SELECT
        COALESCE(tf.country, SPLIT_PART(u.location, ',', -1)) as country,
        SUM(p.amount) as revenue
      FROM "payments" p
      INNER JOIN "users" u ON u.id = p."userId"
      LEFT JOIN "tax_forms" tf ON tf."creatorId" = p."creatorId"
      WHERE p.status = 'SUCCESS'
        AND (tf.country IS NOT NULL OR u.location IS NOT NULL)
      GROUP BY COALESCE(tf.country, SPLIT_PART(u.location, ',', -1))
      ORDER BY revenue DESC
      LIMIT 5
    `;
    console.log('✅ Geography Query Success:', data.length, 'results');
  } catch (error) {
    console.log('❌ Geography Query Failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
  }
}

async function testFunnel() {
  console.log('\n4️⃣ Testing Funnel Query...');
  try {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const usersWithFirstSubscription = await prisma.user.count({
      where: {
        createdAt: { gte: last30Days },
        subscriptionsAsFan: { some: {} },
      },
    });
    console.log('✅ Funnel Query Success:', usersWithFirstSubscription, 'users with subscriptions');
  } catch (error) {
    console.log('❌ Funnel Query Failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
  }
}

async function testUpcomingPayouts() {
  console.log('\n5️⃣ Testing Upcoming Payouts Query...');
  try {
    const payouts = await prisma.payout.findMany({
      where: {
        status: { in: ['PENDING', 'PROCESSING'] },
      },
      orderBy: { estimatedCompletionAt: 'asc' },
      take: 10,
    });
    console.log('✅ Upcoming Payouts Query Success:', payouts.length, 'payouts');
  } catch (error) {
    console.log('❌ Upcoming Payouts Query Failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
  }
}

async function main() {
  console.log('🔍 DIAGNOSING DASHBOARD QUERIES');
  console.log('='.repeat(70));

  await testTopCreators();
  await testEngagement();
  await testGeography();
  await testFunnel();
  await testUpcomingPayouts();

  console.log('\n' + '='.repeat(70));
  console.log('✅ Diagnosis Complete');

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  prisma.$disconnect();
  process.exit(1);
});
