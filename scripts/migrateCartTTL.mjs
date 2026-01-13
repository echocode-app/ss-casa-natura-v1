#!/usr/bin/env node

/**
 * Migration script to add expiresAt field to existing carts
 * This script should be run once after deploying the TTL feature
 */

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __scriptdir = dirname(__filename);
const __rootdir = dirname(__scriptdir);

// Load environment variables
config({ path: join(__rootdir, '.env.local') });
config({ path: join(__rootdir, '.env') });

const { Schema, model } = mongoose;

// Define Cart schema inline (without expiresAt required for reading old docs)
const cartSchema = new Schema(
  {
    userId: String,
    sessionId: String,
    items: [Schema.Types.Mixed],
    subtotal: Number,
    discount: Number,
    promoCode: String,
    promoDiscount: Number,
    total: Number,
    expiresAt: Date,
  },
  { timestamps: true, strict: false }
);

const Cart = mongoose.models.Cart || model('Cart', cartSchema);

// TTL constants
const GUEST_CART_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const USER_CART_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

async function migrateCartTTL() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    console.log('🔗 Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database\n');

    // Find all carts without expiresAt
    const cartsWithoutExpiry = await Cart.find({ expiresAt: { $exists: false } });
    console.log(`📊 Found ${cartsWithoutExpiry.length} carts without expiresAt field\n`);

    if (cartsWithoutExpiry.length === 0) {
      console.log('✨ All carts already have expiresAt field. No migration needed.');
      await mongoose.connection.close();
      process.exit(0);
    }

    let guestCount = 0;
    let userCount = 0;
    let errorCount = 0;

    for (const cart of cartsWithoutExpiry) {
      try {
        const isAuthenticated = !!cart.userId;
        const ttlMs = isAuthenticated ? USER_CART_TTL_MS : GUEST_CART_TTL_MS;
        
        // Set expiration based on cart's updatedAt or createdAt
        const baseDate = cart.updatedAt || cart.createdAt || new Date();
        const expiresAt = new Date(baseDate.getTime() + ttlMs);

        await Cart.updateOne(
          { _id: cart._id },
          { $set: { expiresAt } }
        );

        if (isAuthenticated) {
          userCount++;
          console.log(`✅ Updated user cart ${cart._id} (expires: ${expiresAt.toISOString()})`);
        } else {
          guestCount++;
          console.log(`✅ Updated guest cart ${cart._id} (expires: ${expiresAt.toISOString()})`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating cart ${cart._id}:`, error.message);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Guest carts updated: ${guestCount}`);
    console.log(`   ✅ User carts updated: ${userCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${guestCount + userCount + errorCount}`);

    console.log('\n🎉 Migration completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Verify the TTL index is created: db.carts.getIndexes()');
    console.log('   2. Monitor cart expiration over the next few days');
    console.log('   3. Old carts will be automatically deleted by MongoDB\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

migrateCartTTL();
