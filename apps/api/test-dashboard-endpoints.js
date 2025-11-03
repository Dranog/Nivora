/**
 * Test script for new dashboard endpoints
 *
 * Tests all 6 new endpoints:
 * 1. GET /admin/dashboard/top-creators
 * 2. GET /admin/dashboard/engagement
 * 3. GET /admin/dashboard/activity
 * 4. GET /admin/dashboard/geography
 * 5. GET /admin/dashboard/funnel
 * 6. GET /admin/dashboard/upcoming-payouts
 */

const API_URL = 'http://localhost:3001/api';
const LOGIN_URL = `${API_URL}/auth/login`;

async function login() {
  console.log('🔐 Logging in as admin...');

  const response = await fetch(LOGIN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@oliver.com',
      password: 'Admin123!',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Login failed: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  console.log('✅ Login successful!\n');
  return data.accessToken;
}

async function testEndpoint(token, path, name) {
  console.log('='.repeat(70));
  console.log(`Testing: ${name}`);
  console.log(`Endpoint: GET ${path}`);
  console.log('='.repeat(70));

  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json();
      console.log('❌ Error:', JSON.stringify(error, null, 2));
      return { success: false, name, path, error };
    }

    const data = await response.json();
    console.log('✅ Success!');
    console.log('\nData received:');
    console.log(JSON.stringify(data, null, 2));
    console.log('');

    return { success: true, name, path, data };
  } catch (error) {
    console.log('❌ Exception:', error.message);
    return { success: false, name, path, error: error.message };
  }
}

async function main() {
  console.log('\n');
  console.log('🚀 TESTING NEW DASHBOARD ENDPOINTS');
  console.log('='.repeat(70));
  console.log('\n');

  try {
    // Step 1: Login
    const token = await login();

    // Step 2: Test all 6 new endpoints
    const endpoints = [
      {
        path: '/admin/dashboard/top-creators?limit=5',
        name: 'Top Creators (by revenue)',
        description: 'Returns top 5 creators ranked by total revenue',
      },
      {
        path: '/admin/dashboard/engagement',
        name: 'Engagement Metrics',
        description: 'Returns total likes, comments, shares with growth percentages',
      },
      {
        path: '/admin/dashboard/activity',
        name: 'Activity Metrics',
        description: 'Returns active users now, average session time, bounce rate',
      },
      {
        path: '/admin/dashboard/geography?limit=5',
        name: 'Geography Revenue',
        description: 'Returns top 5 countries by revenue',
      },
      {
        path: '/admin/dashboard/funnel',
        name: 'Conversion Funnel',
        description: 'Returns user journey from visitors to active users',
      },
      {
        path: '/admin/dashboard/upcoming-payouts',
        name: 'Upcoming Payouts',
        description: 'Returns scheduled payouts with days until release',
      },
    ];

    const results = [];
    for (const endpoint of endpoints) {
      const result = await testEndpoint(token, endpoint.path, endpoint.name);
      results.push({ ...result, description: endpoint.description });
      console.log('\n');
    }

    // Step 3: Summary
    console.log('\n');
    console.log('='.repeat(70));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(70));
    console.log('\n');

    results.forEach((r, index) => {
      const status = r.success ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${r.name}`);
      console.log(`   Path: ${r.path}`);
      console.log(`   Desc: ${r.description}`);

      if (r.success) {
        // Show data summary
        if (Array.isArray(r.data)) {
          console.log(`   Result: ${r.data.length} items returned`);
        } else if (typeof r.data === 'object') {
          console.log(`   Result: ${Object.keys(r.data).length} properties`);
        }
      } else {
        console.log(`   Error: ${r.error?.message || r.error}`);
      }
      console.log('');
    });

    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    console.log('='.repeat(70));
    console.log(`RESULTS: ${successCount}/${totalCount} endpoints working`);
    console.log('='.repeat(70));

    if (successCount === totalCount) {
      console.log('\n🎉 ALL ENDPOINTS WORKING! Backend is production-ready!\n');
    } else {
      console.log('\n⚠️  Some endpoints need fixes. See errors above.\n');
    }

    // Step 4: Data Analysis
    console.log('\n');
    console.log('='.repeat(70));
    console.log('📈 DATA ANALYSIS');
    console.log('='.repeat(70));
    console.log('\n');

    results.forEach((r) => {
      if (!r.success) return;

      console.log(`${r.name}:`);

      switch (r.name) {
        case 'Top Creators (by revenue)':
          if (r.data.length === 0) {
            console.log('  - No creators found (database is empty)');
          } else {
            console.log(`  - Found ${r.data.length} creators`);
            r.data.forEach((creator, i) => {
              console.log(`  ${i + 1}. ${creator.displayName || creator.username} - €${(creator.revenue / 100).toFixed(2)}`);
            });
          }
          break;

        case 'Engagement Metrics':
          console.log(`  - Total Likes: ${r.data.totalLikes?.toLocaleString() || 0}`);
          console.log(`  - Total Comments: ${r.data.totalComments?.toLocaleString() || 0}`);
          console.log(`  - Total Shares: ${r.data.totalShares?.toLocaleString() || 0}`);
          console.log(`  - Likes Growth: ${r.data.likesGrowth?.toFixed(1) || 0}%`);
          console.log(`  - Comments Growth: ${r.data.commentsGrowth?.toFixed(1) || 0}%`);
          console.log(`  - Shares Growth: ${r.data.sharesGrowth?.toFixed(1) || 0}%`);
          break;

        case 'Activity Metrics':
          console.log(`  - Active Now: ${r.data.activeNow || 0} users`);
          console.log(`  - Avg Session Time: ${Math.round(r.data.averageSessionTime / 60) || 0} minutes`);
          console.log(`  - Bounce Rate: ${r.data.bounceRate?.toFixed(1) || 0}%`);
          break;

        case 'Geography Revenue':
          if (r.data.length === 0) {
            console.log('  - No geography data (no payments yet)');
          } else {
            console.log(`  - Found ${r.data.length} countries`);
            r.data.forEach((geo, i) => {
              console.log(`  ${i + 1}. ${geo.country} (${geo.countryCode}) - €${(geo.revenue / 100).toFixed(2)} (${geo.percentage.toFixed(1)}%)`);
            });
          }
          break;

        case 'Conversion Funnel':
          console.log(`  - Visitors: ${r.data.visitors?.toLocaleString() || 0}`);
          console.log(`  - Signups: ${r.data.signups?.toLocaleString() || 0} (${((r.data.signups / r.data.visitors) * 100 || 0).toFixed(1)}%)`);
          console.log(`  - Profile Completed: ${r.data.profileCompleted?.toLocaleString() || 0} (${((r.data.profileCompleted / r.data.visitors) * 100 || 0).toFixed(1)}%)`);
          console.log(`  - First Subscription: ${r.data.firstSubscription?.toLocaleString() || 0} (${((r.data.firstSubscription / r.data.visitors) * 100 || 0).toFixed(1)}%)`);
          console.log(`  - Active Users: ${r.data.activeUsers?.toLocaleString() || 0} (${((r.data.activeUsers / r.data.visitors) * 100 || 0).toFixed(1)}%)`);
          break;

        case 'Upcoming Payouts':
          if (r.data.length === 0) {
            console.log('  - No upcoming payouts scheduled');
          } else {
            console.log(`  - Found ${r.data.length} upcoming payouts`);
            r.data.forEach((payout, i) => {
              const date = new Date(payout.estimatedDate);
              console.log(`  ${i + 1}. In ${payout.daysUntil} days - €${(payout.amount / 100).toFixed(2)} (${payout.status})`);
              console.log(`      Estimated: ${date.toLocaleDateString()}`);
            });
          }
          break;
      }

      console.log('');
    });

    console.log('='.repeat(70));
    console.log('✨ Testing complete!');
    console.log('='.repeat(70));
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Run the tests
main();
