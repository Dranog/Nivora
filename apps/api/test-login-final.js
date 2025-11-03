async function testLogin() {
  try {
    console.log('🧪 FINAL LOGIN TEST\n');

    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@oliver.com',
        password: 'Admin123!',
      }),
    });

    console.log('Status:', response.status, response.statusText);
    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ LOGIN SUCCESSFUL!\n');
      console.log('Response:', {
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
        user: {
          id: data.user?.id,
          email: data.user?.email,
          role: data.user?.role,
        }
      });
      console.log('\n🎉 You can now login from frontend: http://localhost:3000/admin/login');
    } else {
      console.log('\n❌ LOGIN FAILED\n');
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
  }
}

testLogin();
