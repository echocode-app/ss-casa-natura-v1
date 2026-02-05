/**
 * Comprehensive Authentication System Test Script
 *
 * This script performs end-to-end testing of the Next.js + MongoDB + JWT authentication system.
 * It tests API routes, simulates frontend interactions, validates JWT handling, and runs full flows.
 *
 * Requirements:
 * - Next.js dev server running on http://localhost:3000
 * - MongoDB connection available
 * - Environment variables set (.env.local)
 *
 * Run: npx ts-node scripts/testAuth.ts
 */

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  details: string;
  statusCode?: number;
  response?: any;
  error?: string;
}

const results: TestResult[] = [];
let cookieJar = ''; // To store cookies across requests

const testUser = {
  nome: `TestUser_${Date.now()}`,
  cognome: `Surname_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'SecurePassword123',
  newPassword: 'NewSecurePassword456',
};

const log = (result: TestResult) => {
  results.push(result);
  const emoji = result.status === 'PASS' ? '✅' : '❌';
  console.log(`\n${emoji} [${result.test}] ${result.status}`);
  console.log(`   Details: ${result.details}`);
  if (result.statusCode) console.log(`   Status Code: ${result.statusCode}`);
  if (result.response) console.log(`   Response:`, JSON.stringify(result.response, null, 2));
  if (result.error) console.log(`   Error: ${result.error}`);
};

// Helper to make requests with cookie handling
const makeRequest = async (url: string, options: any = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    Cookie: cookieJar,
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  // Update cookie jar with Set-Cookie
  const setCookie = response.headers.get('set-cookie');
  if (setCookie) {
    cookieJar = setCookie.split(';')[0]; // Simple cookie extraction
  }

  return response;
};

// Helper to decode JWT from cookie
// Note: Not used in tests, as we test API responses
// const decodeJWT = (token: string) => {
//   try {
//     return jwt.decode(token) as any;
//   } catch {
//     return null;
//   }
// };

async function testDBConnection() {
  try {
    const response = await makeRequest('/api/test-db');
    const data = await response.json();

    if (response.status === 200 && data.status?.startsWith('DB connected')) {
      log({ test: 'DB Connection', status: 'PASS', details: 'Database connection successful', statusCode: response.status, response: data });
    } else if (response.status === 401 || response.status === 403) {
      log({ test: 'DB Connection', status: 'PASS', details: 'Skipped (admin-only endpoint)', statusCode: response.status, response: data });
    } else {
      log({ test: 'DB Connection', status: 'FAIL', details: 'Unexpected response', statusCode: response.status, response: data });
    }
  } catch (error: any) {
    log({ test: 'DB Connection', status: 'FAIL', details: 'Request failed', error: error.message });
  }
}

async function testRegisterSuccess() {
  try {
    const response = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser),
    });
    const data = await response.json();

    if (response.status === 200 && data.user && data.user.email === testUser.email) {
      log({ test: 'Register Success', status: 'PASS', details: 'User registered successfully', statusCode: response.status, response: data });
      return true;
    } else {
      log({ test: 'Register Success', status: 'FAIL', details: 'Unexpected response', statusCode: response.status, response: data });
      return false;
    }
  } catch (error: any) {
    log({ test: 'Register Success', status: 'FAIL', details: 'Request failed', error: error.message });
    return false;
  }
}

async function testRegisterDuplicate() {
  try {
    const response = await makeRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(testUser),
    });
    const data = await response.json();

    if (response.status === 409 && data.error === 'Email already exists') {
      log({ test: 'Register Duplicate', status: 'PASS', details: 'Duplicate registration handled correctly', statusCode: response.status, response: data });
    } else {
      log({ test: 'Register Duplicate', status: 'FAIL', details: 'Unexpected response', statusCode: response.status, response: data });
    }
  } catch (error: any) {
    log({ test: 'Register Duplicate', status: 'FAIL', details: 'Request failed', error: error.message });
  }
}

async function testRegisterInvalid() {
  const invalidCases = [
    { body: { nome: 'Test', cognome: 'User', email: 'invalid', password: 'password123' }, expected: 400 },
    { body: { nome: 'Test', cognome: 'User', email: 'test@example.com', password: '123' }, expected: 400 },
    { body: { cognome: 'User', email: 'test@example.com', password: 'password123' }, expected: 400 },
  ];

  for (const { body, expected } of invalidCases) {
    try {
      const response = await makeRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.status === expected) {
        log({ test: 'Register Invalid', status: 'PASS', details: `Invalid input handled (${expected})`, statusCode: response.status, response: data });
      } else {
        log({ test: 'Register Invalid', status: 'FAIL', details: 'Unexpected status code', statusCode: response.status, response: data });
      }
    } catch (error: any) {
      log({ test: 'Register Invalid', status: 'FAIL', details: 'Request failed', error: error.message });
    }
  }
}

async function testLoginSuccess() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUser.email, password: testUser.password }),
    });
    const data = await response.json();

    if (response.status === 200 && data.user && cookieJar.includes('token=')) {
      log({ test: 'Login Success', status: 'PASS', details: 'Login successful with JWT cookie', statusCode: response.status, response: data });
      return true;
    } else {
      log({ test: 'Login Success', status: 'FAIL', details: 'Login failed or no cookie set', statusCode: response.status, response: data });
      return false;
    }
  } catch (error: any) {
    log({ test: 'Login Success', status: 'FAIL', details: 'Request failed', error: error.message });
    return false;
  }
}

async function testLoginInvalid() {
  try {
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUser.email, password: 'wrongpassword' }),
    });
    const data = await response.json();

    if (response.status === 401 && data.error === 'Invalid credentials') {
      log({ test: 'Login Invalid', status: 'PASS', details: 'Invalid credentials handled correctly', statusCode: response.status, response: data });
    } else {
      log({ test: 'Login Invalid', status: 'FAIL', details: 'Unexpected response', statusCode: response.status, response: data });
    }
  } catch (error: any) {
    log({ test: 'Login Invalid', status: 'FAIL', details: 'Request failed', error: error.message });
  }
}

async function testUsersMe() {
  try {
    const response = await makeRequest('/api/users/me');
    const data = await response.json();

    if (response.status === 200 && data.id && data.email === testUser.email) {
      log({ test: 'Users Me', status: 'PASS', details: 'Protected route accessible with JWT', statusCode: response.status, response: data });
      return true;
    } else {
      log({ test: 'Users Me', status: 'FAIL', details: 'Access denied or wrong data', statusCode: response.status, response: data });
      return false;
    }
  } catch (error: any) {
    log({ test: 'Users Me', status: 'FAIL', details: 'Request failed', error: error.message });
    return false;
  }
}

async function testUsersMeUnauthorized() {
  const oldCookie = cookieJar;
  cookieJar = ''; // Clear cookie

  try {
    const response = await makeRequest('/api/users/me');
    const data = await response.json();

    if (response.status === 401) {
      log({ test: 'Users Me Unauthorized', status: 'PASS', details: 'Protected route correctly denies access without JWT', statusCode: response.status, response: data });
    } else {
      log({ test: 'Users Me Unauthorized', status: 'FAIL', details: 'Unexpected access', statusCode: response.status, response: data });
    }
  } catch (error: any) {
    log({ test: 'Users Me Unauthorized', status: 'FAIL', details: 'Request failed', error: error.message });
  } finally {
    cookieJar = oldCookie; // Restore cookie
  }
}

async function testPasswordChange() {
  try {
    const response = await makeRequest('/api/users/me/password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword: testUser.password, newPassword: testUser.newPassword }),
    });
    const data = await response.json();

    if (response.status === 200) {
      log({ test: 'Password Change', status: 'PASS', details: 'Password changed successfully', statusCode: response.status, response: data });
      // Session should be invalidated
      const checkResponse = await makeRequest('/api/users/me');
      if (checkResponse.status === 401) {
        log({ test: 'Password Change Session Invalidated', status: 'PASS', details: 'Session correctly invalidated after password change' });
      } else {
        log({ test: 'Password Change Session Invalidated', status: 'FAIL', details: 'Session not invalidated' });
      }
      return true;
    } else {
      log({ test: 'Password Change', status: 'FAIL', details: 'Password change failed', statusCode: response.status, response: data });
      return false;
    }
  } catch (error: any) {
    log({ test: 'Password Change', status: 'FAIL', details: 'Request failed', error: error.message });
    return false;
  }
}

async function testUsersMeOrders() {
  try {
    const response = await makeRequest('/api/users/me/orders');
    const data = await response.json();

    if (response.status === 200) {
      log({ test: 'Users Me Orders', status: 'PASS', details: 'Orders endpoint accessible with JWT', statusCode: response.status, response: data });
    } else {
      log({ test: 'Users Me Orders', status: 'FAIL', details: 'Access denied', statusCode: response.status, response: data });
    }
  } catch (error: any) {
    log({ test: 'Users Me Orders', status: 'FAIL', details: 'Request failed', error: error.message });
  }
}

async function testLogout() {
  try {
    const response = await makeRequest('/api/auth/logout', { method: 'POST' });
    const data = await response.json();

    if (response.status === 200 && data.ok === true && !cookieJar.includes('token=')) {
      log({ test: 'Logout', status: 'PASS', details: 'Logout successful, cookie cleared', statusCode: response.status, response: data });
    } else {
      log({ test: 'Logout', status: 'FAIL', details: 'Logout failed or cookie not cleared', statusCode: response.status, response: data });
    }
  } catch (error: any) {
    log({ test: 'Logout', status: 'FAIL', details: 'Request failed', error: error.message });
  }
}

async function testJWTCookieProperties() {
  // This is hard to test precisely with fetch, but we can check if token is present
  if (cookieJar.includes('token=')) {
    log({ test: 'JWT Cookie Set', status: 'PASS', details: 'JWT token present in cookie' });
  } else {
    log({ test: 'JWT Cookie Set', status: 'FAIL', details: 'No JWT token in cookie' });
  }
}

async function testEndToEndFlow() {
  console.log('\n🚀 Starting End-to-End Flow...');

  // Reset cookie
  cookieJar = '';

  // 1. Register
  const registered = await testRegisterSuccess();
  if (!registered) return;

  // 2. Login
  const loggedIn = await testLoginSuccess();
  if (!loggedIn) return;

  // 3. Access profile
  const profileAccessed = await testUsersMe();
  if (!profileAccessed) return;

  // 4. Fetch orders
  await testUsersMeOrders();

  // 5. Change password
  const passwordChanged = await testPasswordChange();
  if (passwordChanged) {
    // Re-login with new password
    cookieJar = '';
    const response = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: testUser.email, password: testUser.newPassword }),
    });
    if (response.status === 200) {
      log({ test: 'Re-login after Password Change', status: 'PASS', details: 'Successfully logged in with new password' });
    } else {
      log({ test: 'Re-login after Password Change', status: 'FAIL', details: 'Failed to login with new password' });
    }
  }

  // 6. Logout
  await testLogout();

  console.log('🏁 End-to-End Flow Complete');
}

async function main() {
  console.log('🧪 Starting Authentication System Tests...\n');

  // Backend Tests
  await testDBConnection();
  await testRegisterSuccess();
  await testRegisterDuplicate();
  await testRegisterInvalid();
  await testLoginSuccess();
  await testLoginInvalid();
  await testUsersMe();
  await testUsersMeUnauthorized();
  await testPasswordChange();
  await testUsersMeOrders();
  await testLogout();
  await testJWTCookieProperties();

  // End-to-End Flow
  await testEndToEndFlow();

  // Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  const total = results.length;
  console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All tests passed!');
  } else {
    console.log('❌ Some tests failed. Check logs above.');
    process.exit(1);
  }
}

main().catch(console.error);
