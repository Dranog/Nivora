async function testDashboard() {
  try {
    console.log('🧪 TESTING DASHBOARD ENDPOINT...\n');

    // First login to get token
    console.log('1️⃣ Logging in...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@oliver.com',
        password: 'Admin123!',
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful');

    // Test dashboard endpoint
    console.log('\n2️⃣ Fetching dashboard data...');
    const dashboardResponse = await fetch('http://localhost:3001/api/admin/dashboard/metrics?period=week', {
      headers: {
        'Authorization': `Bearer ${loginData.accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', dashboardResponse.status, dashboardResponse.statusText);

    if (dashboardResponse.ok) {
      const data = await dashboardResponse.json();
      console.log('\n✅ DASHBOARD LOADED SUCCESSFULLY!\n');
      console.log('Response structure:');
      console.log('- Has metrics:', !!data.metrics);
      console.log('- Has charts:', !!data.charts);
      console.log('- Has recentActivity:', !!data.recentActivity);
      console.log('- Has cachedAt:', !!data.cachedAt);
      console.log('\n🎉 Dashboard API is working!');
    } else {
      const error = await dashboardResponse.json();
      console.log('\n❌ DASHBOARD FAILED\n');
      console.log('Error:', JSON.stringify(error, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testDashboard();
