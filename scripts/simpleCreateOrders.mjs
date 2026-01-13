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

async function createTestOrders() {
  try {
    console.log('🔌 Підключення до MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Підключено');

    // Отримуємо користувача
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const testUser = await User.findOne({ email: 'test1768167552430@example.com' });
    
    if (!testUser) {
      console.log('❌ Користувача test1768167552430@example.com не знайдено');
      process.exit(1);
    }
    console.log('✅ Користувача знайдено:', testUser._id);

    // Отримуємо продукти
    const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false }));
    const allProducts = await Product.find().limit(20).lean();
    
    if (allProducts.length === 0) {
      console.log('❌ Продукти не знайдено в БД');
      process.exit(1);
    }
    console.log(`✅ Знайдено продуктів: ${allProducts.length}`);

    // Створюємо Order model
    const Order = mongoose.model('Order', new mongoose.Schema({}, { strict: false }));

    // Видаляємо старі тестові замовлення
    await Order.deleteMany({ userId: testUser._id });
    console.log('🗑️ Видалено старі тестові замовлення');

    // Замовлення 1: 1 товар, оплачене, 30 днів тому
    const order1Date = new Date();
    order1Date.setDate(order1Date.getDate() - 30);
    
    const order1 = await Order.create({
      userId: testUser._id,
      products: [{
        productId: allProducts[0]._id,
        quantity: 2,
        name: allProducts[0].name,
        price: allProducts[0].price
      }],
      status: 'paid',
      totalPrice: allProducts[0].price * 2,
      createdAt: order1Date,
      updatedAt: order1Date
    });
    console.log('✅ Створено замовлення 1:', order1._id);

    // Замовлення 2: 5 товарів, відправлене, 15 днів тому
    const order2Date = new Date();
    order2Date.setDate(order2Date.getDate() - 15);
    
    const order2Products = allProducts.slice(1, 6).map(p => ({
      productId: p._id,
      quantity: 1,
      name: p.name,
      price: p.price
    }));
    
    const order2Total = order2Products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    
    const order2 = await Order.create({
      userId: testUser._id,
      products: order2Products,
      status: 'shipped',
      totalPrice: order2Total,
      createdAt: order2Date,
      updatedAt: order2Date
    });
    console.log('✅ Створено замовлення 2:', order2._id);

    // Замовлення 3: 10 товарів, очікує, 2 дні тому
    const order3Date = new Date();
    order3Date.setDate(order3Date.getDate() - 2);
    
    const order3Products = allProducts.slice(6, 16).map(p => ({
      productId: p._id,
      quantity: Math.floor(Math.random() * 3) + 1,
      name: p.name,
      price: p.price
    }));
    
    const order3Total = order3Products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    
    const order3 = await Order.create({
      userId: testUser._id,
      products: order3Products,
      status: 'pending',
      totalPrice: order3Total,
      createdAt: order3Date,
      updatedAt: order3Date
    });
    console.log('✅ Створено замовлення 3:', order3._id);

    // Перевірка
    const userOrders = await Order.find({ userId: testUser._id }).lean();
    console.log(`\n✅ Всього замовлень для користувача: ${userOrders.length}`);
    
    userOrders.forEach((order, idx) => {
      console.log(`\nЗамовлення ${idx + 1}:`);
      console.log(`  ID: ${order._id}`);
      console.log(`  Статус: ${order.status}`);
      console.log(`  Товарів: ${order.products.length}`);
      console.log(`  Сума: €${order.totalPrice.toFixed(2)}`);
      console.log(`  Дата: ${new Date(order.createdAt).toLocaleDateString('it-IT')}`);
    });

    console.log('\n🎉 Готово!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Помилка:', error);
    process.exit(1);
  }
}

createTestOrders();
