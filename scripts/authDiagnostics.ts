/**
 * Повна перевірка системи авторизації
 * Запустити: npm run check && npm run dev
 * Потім у іншому терміналі: npx ts-node scripts/authDiagnostics.ts
 */

import { spawn } from 'child_process';

interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warn';
  details: string;
}

const results: DiagnosticResult[] = [];

function log(test: string, status: 'pass' | 'fail' | 'warn', details: string) {
  results.push({ test, status, details });
  const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  console.log(`${icon} ${test}`);
  if (details) console.log(`   ${details}`);
}

async function main() {
  console.log('🔐 Діагностика системи авторизації\n');

  // 1. Перевірка .env.local
  console.log('📋 Перевірка конфігурації...');
  try {
    const env = process.env;
    if (!env.JWT_SECRET) {
      log('JWT_SECRET', 'fail', 'Не встановлена. Встановіть у .env.local');
    } else if (env.JWT_SECRET.length < 32) {
      log('JWT_SECRET', 'warn', 'Менше 32 символів (рекомендується мінімум 32)');
    } else {
      log('JWT_SECRET', 'pass', `Встановлена (${env.JWT_SECRET.length} символів)`);
    }

    if (!env.DATABASE_URL) {
      log('DATABASE_URL', 'fail', 'Не встановлена. Встановіть у .env.local');
    } else {
      log('DATABASE_URL', 'pass', 'Встановлена');
    }

    if (!env.NODE_ENV) {
      log('NODE_ENV', 'warn', 'Не встановлена. Використовується default');
    } else {
      log('NODE_ENV', 'pass', `Встановлена: ${env.NODE_ENV}`);
    }
  } catch (err) {
    log('Конфігурація', 'fail', String(err));
  }

  // 2. Перевірка файлів
  console.log('\n📁 Перевірка файлів...');
  const fs = await import('fs').then((m) => m.promises);
  const filesToCheck = [
    'src/lib/auth/cookies.ts',
    'src/lib/auth/jwt.ts',
    'src/lib/auth/getUser.ts',
    'src/lib/auth/hash.ts',
    'src/app/api/auth/login/route.ts',
    'src/app/api/auth/register/route.ts',
    'src/app/api/users/me/route.ts',
    'src/components/layout/AuthContext.tsx',
    'src/components/ui/Modal/AuthModal.jsx',
  ];

  for (const file of filesToCheck) {
    try {
      await fs.access(file);
      log(`Файл: ${file}`, 'pass', 'Знайдено');
    } catch {
      log(`Файл: ${file}`, 'fail', 'Не знайдено');
    }
  }

  // 3. Перевірка коду
  console.log('\n🔍 Перевірка коду...');
  try {
    const authModalContent = await fs.readFile('src/components/ui/Modal/AuthModal.jsx', 'utf-8');
    if (authModalContent.includes("credentials: 'include'")) {
      log('AuthModal credentials', 'pass', 'credentials: "include" знайдено в fetch запитах');
    } else {
      log('AuthModal credentials', 'fail', 'credentials: "include" відсутній в fetch запитах');
    }

    if (authModalContent.includes("notify.success") && authModalContent.includes("notify.error")) {
      log('AuthModal локалізація', 'pass', 'Використовуються локалізовані повідомлення');
    } else {
      log('AuthModal локалізація', 'warn', 'Можуть бути hardcoded тексти');
    }
  } catch (err) {
    log('Перевірка AuthModal', 'fail', String(err));
  }

  // 4. Перевірка локалізації
  console.log('\n🌍 Перевірка локалізації...');
  try {
    const enMessages = await fs.readFile('src/messages/common/en.json', 'utf-8');
    const itMessages = await fs.readFile('src/messages/common/it.json', 'utf-8');

    const enJson = JSON.parse(enMessages);
    const itJson = JSON.parse(itMessages);

    const requiredKeys = ['errors.invalidCredentials', 'errors.loginFailed', 'success.loginSuccess', 'success.registrationSuccess'];

    for (const key of requiredKeys) {
      const [section, subkey] = key.split('.');
      if (enJson[section]?.[subkey] && itJson[section]?.[subkey]) {
        log(`Локаль: ${key}`, 'pass', 'EN + IT знайдено');
      } else {
        log(`Локаль: ${key}`, 'fail', 'Відсутня або неповна локалізація');
      }
    }
  } catch (err) {
    log('Перевірка локалізації', 'fail', String(err));
  }

  // 5. Перевірка типів
  console.log('\n✨ Перевірка TypeScript...');
  try {
    // Run tsc --noEmit
    const tsc = spawn('npx', ['tsc', '--noEmit'], { cwd: process.cwd() });

    let tcOutput = '';
    tsc.stdout?.on('data', (data) => {
      tcOutput += data.toString();
    });
    tsc.stderr?.on('data', (data) => {
      tcOutput += data.toString();
    });

    await new Promise((resolve) => tsc.on('close', resolve));

    if (tsc.exitCode === 0) {
      log('TypeScript компіляція', 'pass', 'Усі типи коректні');
    } else {
      log('TypeScript компіляція', 'fail', `Помилки типів (exit code: ${tsc.exitCode})`);
    }
  } catch (err) {
    log('TypeScript компіляція', 'warn', `Не вдалося перевірити: ${String(err)}`);
  }

  // Результати
  console.log('\n═'.repeat(60));
  console.log('📊 РЕЗУЛЬТАТИ ДІАГНОСТИКИ\n');

  const passed = results.filter((r) => r.status === 'pass').length;
  const failed = results.filter((r) => r.status === 'fail').length;
  const warned = results.filter((r) => r.status === 'warn').length;

  console.log(`✅ Пройдено: ${passed}`);
  console.log(`❌ Помилок: ${failed}`);
  console.log(`⚠️  Попереджень: ${warned}`);

  if (failed > 0) {
    console.log('\n🔴 КРИТИЧНІ ПРОБЛЕМИ:\n');
    results
      .filter((r) => r.status === 'fail')
      .forEach((r) => {
        console.log(`  ❌ ${r.test}`);
        if (r.details) console.log(`     ${r.details}\n`);
      });

    console.log('\n💡 РІШЕННЯ:\n');
    if (failed > 0) {
      console.log('  1. Встановіть JWT_SECRET в .env.local (мінімум 32 символи)');
      console.log('  2. Встановіть DATABASE_URL в .env.local');
      console.log('  3. Переконайтесь, що все файли на місці');
      console.log('  4. Запустіть: npm run check');
      console.log('  5. Запустіть dev сервер: npm run dev\n');
    }
  } else if (warned > 0) {
    console.log('\n⚠️  ПОПЕРЕДЖЕНЬ:\n');
    results
      .filter((r) => r.status === 'warn')
      .forEach((r) => {
        console.log(`  ⚠️  ${r.test}`);
        if (r.details) console.log(`     ${r.details}\n`);
      });
  } else {
    console.log('\n🟢 СИСТЕМА АВТОРИЗАЦІЇ НАЛАШТОВАНА КОРЕКТНО!\n');
    console.log('Наступні кроки:');
    console.log('  1. Запустіть dev сервер: npm run dev');
    console.log('  2. Відкрийте http://localhost:3000');
    console.log('  3. Спробуйте реєстрацію та логіна');
    console.log('  4. Перевірте DevTools → Application → Cookies → token\n');
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('💥 Помилка під час діагностики:', err);
  process.exit(1);
});
