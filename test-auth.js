#!/usr/bin/env node

// Test script for authentication flow
const baseUrl = 'http://localhost:3000';

async function testRegistration() {
  console.log('\n=== Testing Registration ===');
  
  const testUser = {
    nome: 'Test',
    cognome: 'User',
    email: `test${Date.now()}@example.com`,
    password: 'TestPass123',
  };

  console.log('Registering user:', testUser.email);

  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(testUser),
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ Registration successful!');
      
      // Extract cookie from response
      const cookies = response.headers.get('set-cookie');
      console.log('Cookies:', cookies);
      
      return { success: true, email: testUser.email, password: testUser.password };
    } else {
      console.log('❌ Registration failed:', data.error);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return { success: false };
  }
}

async function testLogin(email, password) {
  console.log('\n=== Testing Login ===');
  console.log('Logging in:', email);

  try {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ Login successful!');
      return { success: true };
    } else {
      console.log('❌ Login failed:', data.error);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return { success: false };
  }
}

async function testGetUser(cookieHeader) {
  console.log('\n=== Testing Get User ===');

  try {
    const response = await fetch(`${baseUrl}/api/users/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
      },
      credentials: 'include',
    });

    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Response data:', data);

    if (response.ok) {
      console.log('✅ Get user successful!');
      return { success: true };
    } else {
      console.log('❌ Get user failed:', data.error);
      return { success: false };
    }
  } catch (error) {
    console.error('❌ Get user error:', error.message);
    return { success: false };
  }
}

async function runTests() {
  console.log('🚀 Starting authentication tests...');
  console.log('Base URL:', baseUrl);

  // Test registration
  const regResult = await testRegistration();

  if (regResult.success) {
    // Test login with the same credentials
    await testLogin(regResult.email, regResult.password);
  }

  console.log('\n✨ Tests completed!');
}

runTests().catch(console.error);
