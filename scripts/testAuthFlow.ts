/**
 * npx ts-node scripts/testAuthFlow.ts
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn();
    results.push({ name, status: 'pass', message: 'OK' });
    console.log(`✅ ${name}`);
  } catch (err: any) {
    results.push({ name, status: 'fail', message: err.message });
    console.log(`❌ ${name}: ${err.message}`);
  }
}

async function main() {
  console.log('🔐 Запуск тестів авторизації...\n');

  // Test 1: Регістрація
  let authToken: string | null = null;
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123';

  await test('Реєстрація користувача', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Test',
        cognome: 'User',
        email: testEmail,
        password: testPassword,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }

    const data = (await res.json()) as any;
    if (!data.user?.email) {
      throw new Error('Відповідь не містить user.email');
    }
  });

  await test('Логіна існуючого користувача', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }

    const data = (await res.json()) as any;
    if (!data.user?.email) {
      throw new Error('Відповідь не містить user.email');
    }

    // Extract token from cookies
    const setCookieHeader = res.headers.get('set-cookie');
    if (!setCookieHeader || !setCookieHeader.includes('token=')) {
      throw new Error('Cookies не встановлено: ' + (setCookieHeader || 'null'));
    }

    authToken = setCookieHeader.match(/token=([^;]+)/)?.[1] || null;
    if (!authToken) {
      throw new Error('Не можна витягти токен з cookies');
    }
  });

  await test('Отримання інформації про користувача (/api/users/me)', async () => {
    const res = await fetch(`${BASE_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        Cookie: authToken ? `token=${authToken}` : '',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }

    const data = (await res.json()) as any;
    if (!data.email) {
      throw new Error('Відповідь не містить email');
    }
  });

  await test('Відхилення неправильного пароля', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword123',
      }),
    });

    if (res.ok) {
      throw new Error('Повинна виникнути помилка для неправильного пароля');
    }

    if (res.status !== 401) {
      throw new Error(`Очікується статус 401, отримано ${res.status}`);
    }
  });

  await test('Вихід користувача', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        Cookie: authToken ? `token=${authToken}` : '',
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text}`);
    }
  });

  console.log('\n📊 Результати тестування:');
  console.log('═'.repeat(50));

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;

  console.log(`✅ Пройдено: ${passed}`);
  console.log(`❌ Помилок: ${failed}`);
  console.log(`⏭️  Пропущено: ${results.filter((r) => r.status === 'skip').length}`);

  if (failed > 0) {
    console.log('\n🔴 Помилки:');
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => {
        console.log(`  • ${r.name}: ${r.message}`);
      });
    process.exit(1);
  } else {
    console.log('\n🟢 Усі тести пройдені!');
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('💥 Помилка під час виконання тестів:', err);
  process.exit(1);
});
