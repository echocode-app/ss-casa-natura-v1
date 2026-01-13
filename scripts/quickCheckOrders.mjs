#!/usr/bin/env node
import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __scriptdir = dirname(__filename);
const __rootdir = dirname(__scriptdir);

config({ path: join(__rootdir, '.env.local') });
config({ path: join(__rootdir, '.env') });

const orderSchema = new mongoose.Schema({}, { strict: false });
const Order = mongoose.model('Order', orderSchema);

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const testUser = await User.findOne({ email: 'test1768167552430@example.com' });
    if (!testUser) {
      console.log('❌ Користувача не знайдено');
      process.exit(1);
    }
    
    const orders = await Order.find({ userId: testUser._id }).lean();
    console.log(`✅ Знайдено замовлень: ${orders.length}`);
    
    if (orders.length > 0) {
      orders.forEach((order, idx) => {
        console.log(`\nЗамовлення ${idx + 1}:`);
        console.log(`  Статус: ${order.status}`);
        console.log(`  Сума: €${order.totalPrice?.toFixed(2) || '0.00'}`);
        console.log(`  Товарів: ${order.products?.length || 0}`);
        console.log(`  Дата: ${order.createdAt}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка:', error.message);
    process.exit(1);
  }
}

check();
