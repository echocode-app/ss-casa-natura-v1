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

const { Schema, model } = mongoose;

const userSchema = new Schema({
  email: String,
  orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
}, { strict: false });

const orderSchema = new Schema({
  userId: Schema.Types.ObjectId,
  products: Array,
  status: String,
  totalPrice: Number,
}, { timestamps: true, strict: false });

const User = mongoose.models.User || model('User', userSchema);
const Order = mongoose.models.Order || model('Order', orderSchema);

async function checkOrders() {
  try {
    const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!MONGO_URI) throw new Error('Mongo URI not found');

    console.log('🔗 Connecting to database...\n');
    await mongoose.connect(MONGO_URI);

    const userEmail = 'test1768167552430@example.com';
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      console.log('❌ User not found:', userEmail);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.email}`);
    console.log(`   ID: ${user._id}`);
    console.log(`   ID type: ${typeof user._id}`);
    console.log(`   Orders in user.orders: ${user.orders?.length || 0}\n`);

    // Find orders by userId
    const orders = await Order.find({ userId: user._id });
    console.log(`📦 Orders found for userId ${user._id}: ${orders.length}\n`);

    if (orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`);
        console.log(`  ID: ${order._id}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Total: €${order.totalPrice}`);
        console.log(`  Products: ${order.products?.length || 0}`);
        console.log(`  Created: ${order.createdAt}`);
        console.log('');
      });
    } else {
      console.log('❌ No orders found. Run: npm run orders:create');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkOrders();
