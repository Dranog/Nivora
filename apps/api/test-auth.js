/**
 * Auth Module Security Test Suite
 * Tests all authentication endpoints and security features
 */

const API_URL = 'http://localhost:3001/api/auth';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✓ ${name}`, 'green');
  } else {
    testResults.failed++;
    log(`✗ ${name}`, 'red');
  }
  if (details) {
    log(`  ${details}`, 'cyan');
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testRegisterWithWeakPassword() {
  log('\n=== TEST 1: Register with weak password (should fail) ===', 'yellow');

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'weak123',
        passwordConfirm: 'weak123',
        role: 'FAN'
      })
    });

    const data = await response.json();
    const failed = response.status === 400 && data.message.includes('Password must');

    logTest(
      'Weak password validation',
      failed,
      `Status: ${response.status}, Message: ${JSON.stringify(data.message)}`
    );
  } catch (error) {
    logTest('Weak password validation', false, error.message);
  }
}

async function testRegisterWithStrongPassword() {
  log('\n=== TEST 2: Register with strong password (should succeed) ===', 'yellow');

  const timestamp = Date.now();
  const email = `testuser${timestamp}@example.com`;

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'StrongPass123!',
        passwordConfirm: 'StrongPass123!',
        role: 'FAN'
      })
    });

    const data = await response.json();
    const passed = response.status === 201 && data.accessToken && data.refreshToken && data.user;

    logTest(
      'Strong password registration',
      passed,
      `Status: ${response.status}, Has tokens: ${!!data.accessToken}, User: ${data.user?.email}`
    );

    // Store for later tests
    global.testUser = { email, password: 'StrongPass123!', tokens: data };

  } catch (error) {
    logTest('Strong password registration', false, error.message);
  }
}

async function testLoginWithCorrectPassword() {
  log('\n=== TEST 3: Login with correct password (should succeed) ===', 'yellow');

  if (!global.testUser) {
    logTest('Login with correct password', false, 'No test user available');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: global.testUser.email,
        password: global.testUser.password
      })
    });

    const data = await response.json();
    const passed = response.status === 200 && data.accessToken && data.refreshToken;

    logTest(
      'Successful login',
      passed,
      `Status: ${response.status}, Has tokens: ${!!data.accessToken}`
    );

    if (passed) {
      global.testUser.loginTokens = data;
    }

  } catch (error) {
    logTest('Successful login', false, error.message);
  }
}

async function testLoginWithWrongPassword() {
  log('\n=== TEST 4: Login with wrong password (should fail) ===', 'yellow');

  if (!global.testUser) {
    logTest('Login with wrong password', false, 'No test user available');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: global.testUser.email,
        password: 'WrongPassword123!'
      })
    });

    const data = await response.json();
    const passed = response.status === 401 && data.error === 'InvalidCredentials';

    logTest(
      'Wrong password rejected',
      passed,
      `Status: ${response.status}, Error: ${data.error}`
    );

  } catch (error) {
    logTest('Wrong password rejected', false, error.message);
  }
}

async function testAccountLockout() {
  log('\n=== TEST 5: Account lockout after 10 failed attempts ===', 'yellow');

  // Create a fresh user for lockout test
  const timestamp = Date.now();
  const email = `lockouttest${timestamp}@example.com`;

  try {
    // Register user
    const registerResponse = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'LockoutTest123!',
        passwordConfirm: 'LockoutTest123!',
        role: 'FAN'
      })
    });

    if (registerResponse.status !== 201) {
      logTest('Account lockout test setup', false, 'Failed to create test user');
      return;
    }

    log('  Making 10 failed login attempts...', 'cyan');

    // Make 10 failed attempts
    for (let i = 1; i <= 10; i++) {
      await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: 'WrongPassword!'
        })
      });
      log(`  Attempt ${i}/10`, 'cyan');
      await sleep(150); // Wait for timing attack prevention
    }

    // Try 11th attempt - should be locked
    const lockedResponse = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'WrongPassword!'
      })
    });

    const lockedData = await lockedResponse.json();
    const passed = lockedResponse.status === 403 && lockedData.error === 'AccountLocked';

    logTest(
      'Account locked after 10 attempts',
      passed,
      `Status: ${lockedResponse.status}, Error: ${lockedData.error}, Message: ${lockedData.message}`
    );

  } catch (error) {
    logTest('Account lockout test', false, error.message);
  }
}

async function testTokenRefresh() {
  log('\n=== TEST 6: Token refresh with valid token (should succeed) ===', 'yellow');

  if (!global.testUser?.loginTokens?.refreshToken) {
    logTest('Token refresh', false, 'No refresh token available');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: global.testUser.loginTokens.refreshToken
      })
    });

    const data = await response.json();
    const passed = response.status === 200 && data.accessToken && data.refreshToken;

    logTest(
      'Token refresh successful',
      passed,
      `Status: ${response.status}, New tokens issued: ${!!data.accessToken}`
    );

    if (passed) {
      global.testUser.newTokens = data;
      global.testUser.oldRefreshToken = global.testUser.loginTokens.refreshToken;
    }

  } catch (error) {
    logTest('Token refresh', false, error.message);
  }
}

async function testBlacklistedTokenReuse() {
  log('\n=== TEST 7: Reuse blacklisted refresh token (should fail) ===', 'yellow');

  if (!global.testUser?.oldRefreshToken) {
    logTest('Blacklisted token reuse', false, 'No old refresh token available');
    return;
  }

  try {
    // Try to reuse the old refresh token (should be blacklisted)
    const response = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        refreshToken: global.testUser.oldRefreshToken
      })
    });

    const data = await response.json();
    const passed = response.status === 401 && data.error === 'InvalidRefreshToken';

    logTest(
      'Blacklisted token rejected',
      passed,
      `Status: ${response.status}, Error: ${data.error}`
    );

  } catch (error) {
    logTest('Blacklisted token reuse', false, error.message);
  }
}

async function testLogout() {
  log('\n=== TEST 8: Logout (should succeed) ===', 'yellow');

  if (!global.testUser?.newTokens?.accessToken) {
    logTest('Logout', false, 'No access token available');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${global.testUser.newTokens.accessToken}`
      }
    });

    const data = await response.json();
    const passed = response.status === 200 && data.success === true;

    logTest(
      'Logout successful',
      passed,
      `Status: ${response.status}, Success: ${data.success}`
    );

  } catch (error) {
    logTest('Logout', false, error.message);
  }
}

async function testRateLimiting() {
  log('\n=== TEST 9: Rate limiting (should throttle after limit) ===', 'yellow');

  try {
    log('  Making 4 rapid register attempts (limit is 3/min)...', 'cyan');

    const results = [];
    for (let i = 1; i <= 4; i++) {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `ratelimit${Date.now()}${i}@example.com`,
          password: 'RateLimit123!',
          passwordConfirm: 'RateLimit123!',
          role: 'FAN'
        })
      });
      results.push({ attempt: i, status: response.status });
      log(`  Attempt ${i}: ${response.status}`, 'cyan');
    }

    const throttled = results[3].status === 429;

    logTest(
      'Rate limiting enforced',
      throttled,
      `4th attempt status: ${results[3].status} (expected 429)`
    );

  } catch (error) {
    logTest('Rate limiting', false, error.message);
  }
}

async function printDatabaseVerification() {
  log('\n=== DATABASE VERIFICATION (Manual Check Required) ===', 'blue');
  log('Run these queries in your database to verify:', 'cyan');
  log('');
  log('1. Check audit logs:', 'yellow');
  log('   SELECT event, "userId", "createdAt" FROM audit_logs ORDER BY "createdAt" DESC LIMIT 20;', 'cyan');
  log('');
  log('2. Check user lockout fields:', 'yellow');
  log('   SELECT email, status, "failedLoginAttempts", "lockedUntil" FROM users WHERE email LIKE \'%lockouttest%\';', 'cyan');
  log('');
  log('3. Check sessions (should have blacklisted tokens):', 'yellow');
  log('   SELECT "userId", jti, "expiresAt" FROM sessions ORDER BY "createdAt" DESC LIMIT 10;', 'cyan');
  log('');
}

async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║  AUTH MODULE SECURITY TEST SUITE                           ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');

  await testRegisterWithWeakPassword();
  await sleep(200);

  await testRegisterWithStrongPassword();
  await sleep(200);

  await testLoginWithCorrectPassword();
  await sleep(200);

  await testLoginWithWrongPassword();
  await sleep(200);

  await testAccountLockout();
  await sleep(200);

  await testTokenRefresh();
  await sleep(200);

  await testBlacklistedTokenReuse();
  await sleep(200);

  await testLogout();
  await sleep(200);

  await testRateLimiting();

  await printDatabaseVerification();

  // Print summary
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║  TEST RESULTS SUMMARY                                      ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  log(`Total Tests: ${testResults.total}`, 'cyan');
  log(`Passed: ${testResults.passed}`, 'green');
  log(`Failed: ${testResults.failed}`, testResults.failed > 0 ? 'red' : 'green');
  log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, testResults.failed > 0 ? 'yellow' : 'green');
  log('');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  log(`\nFatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
