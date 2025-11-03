// Test login endpoint directly
// Using native fetch (Node 18+)

async function testLogin() {
  try {
    console.log('🧪 Testing login endpoint...\n');

    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@oliver.com',
        password: 'Admin123!',
      }),
    });

    console.log('Status:', response.status, response.statusText);

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ LOGIN SUCCESSFUL!');
      console.log('\nResponse:');
      console.log('- Has accessToken:', !!data.accessToken);
      console.log('- Has refreshToken:', !!data.refreshToken);
      console.log('- Has user:', !!data.user);
      if (data.user) {
        console.log('\nUser data:');
        console.log('  - ID:', data.user.id);
        console.log('  - Email:', data.user.email);
        console.log('  - Username:', data.user.username);
        console.log('  - Role:', data.user.role);
        console.log('  - DisplayName:', data.user.displayName || '(null)');
      }
      console.log('\n🎉 Login is working! You can now login from the frontend.');
    } else {
      console.log('\n❌ LOGIN FAILED');
      console.log('\nError response:', JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
    console.error('\n⚠️ Make sure the backend API is running on http://localhost:3001');
  }
}

testLogin();
