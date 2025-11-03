// Test script for new dashboard endpoints
const API_URL = 'http://localhost:4000/api';
const LOGIN_URL = `${API_URL}/auth/login`;

async function login() {
  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@oliver.com',
        password: 'Admin123!',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = await response.json();
    return data.accessToken;
  } catch (error) {
    console.error('Login failed:', error.message);
    throw error;
  }
}

async function testEndpoint(token, path, name) {
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`Endpoint: GET ${path}`);
    console.log('='.repeat(60));

    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Status:', response.status);
      console.error('❌ Error:', JSON.stringify(error, null, 2));
      return false;
    }

    const data = await response.json();
    console.log('✅ Status:', response.status);
    console.log('✅ Data:', JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Testing New Dashboard Endpoints');
  console.log('='.repeat(60));

  // Login
  console.log('\n📝 Logging in as admin...');
  const token = await login();
  console.log('✅ Login successful!');

  // Test all 6 new endpoints
  const endpoints = [
    { path: '/admin/dashboard/top-creators', name: 'Top Creators' },
    { path: '/admin/dashboard/engagement', name: 'Engagement Metrics' },
    { path: '/admin/dashboard/activity', name: 'Activity Metrics' },
    { path: '/admin/dashboard/geography', name: 'Geography Data' },
    { path: '/admin/dashboard/funnel', name: 'Conversion Funnel' },
    { path: '/admin/dashboard/upcoming-payouts', name: 'Upcoming Payouts' },
  ];

  const results = [];
  for (const endpoint of endpoints) {
    const success = await testEndpoint(token, endpoint.path, endpoint.name);
    results.push({ ...endpoint, success });
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));
  results.forEach((r) => {
    const status = r.success ? '✅' : '❌';
    console.log(`${status} ${r.name}: ${r.path}`);
  });

  const successCount = results.filter((r) => r.success).length;
  console.log(`\n${successCount}/${results.length} endpoints working`);

  if (successCount === results.length) {
    console.log('\n🎉 ALL ENDPOINTS WORKING! Backend is production-ready!');
  } else {
    console.log('\n⚠️  Some endpoints need fixes');
  }
}

main().catch(console.error);
