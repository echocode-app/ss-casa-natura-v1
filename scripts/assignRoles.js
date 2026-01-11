#!/usr/bin/env node

/**
 * Assign Roles CLI Script
 * 
 * Standalone Node.js script for assigning roles to users
 * 
 * Usage:
 *   node scripts/assignRoles.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

const emails = {
  'kotlyaranya1771@gmail.com': 'developer',
  'developer212800@gmail.com': 'superadmin',
};

async function updateRoles() {
  if (!MONGODB_URI) {
    console.error('✗ MONGODB_URI не встановлено в .env.local');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('✓ Підключено до MongoDB');

    const db = client.db();

    for (const [email, role] of Object.entries(emails)) {
      const result = await db.collection('users').updateOne(
        { email },
        { $set: { role } }
      );

      if (result.modifiedCount > 0) {
        console.log(`✓ ${email} → ${role}`);
      } else {
        console.log(`✗ ${email} не знайдений`);
      }
    }

    const users = await db
      .collection('users')
      .find({ email: { $in: Object.keys(emails) } })
      .project({ email: 1, role: 1 })
      .toArray();

    console.log('\nОновлені користувачі:');
    users.forEach((u) => {
      console.log(`  ${u.email}: ${u.role}`);
    });

    await client.close();
    console.log('\n✓ Готово!');
  } catch (error) {
    console.error('✗ Помилка:', error.message);
    process.exit(1);
  }
}

updateRoles();
