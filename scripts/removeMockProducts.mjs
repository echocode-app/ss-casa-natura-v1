#!/usr/bin/env node
/**
 * Script to remove mock products (prod-001 to prod-030) from MongoDB CatalogProduct collection
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ MongoDB connection string not found in environment variables');
  console.error('Expected one of: MONGO_URI, MONGODB_URI, DATABASE_URL');
  process.exit(1);
}

// CatalogProduct Schema
const catalogProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  sku: String,
  slug: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  categoryIds: [String],
  lineId: String,
  images: [{ src: String, alt: String }],
  variants: [
    {
      id: String,
      label: String,
      volume: Number,
      unit: String,
      priceModifier: Number,
      weightGrams: Number,
      stock: { type: Number, default: 0 },
    },
  ],
  weightGrams: Number,
  price: Number,
  currency: String,
  isBestSeller: Boolean,
  isNew: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CatalogProduct =
  mongoose.models.CatalogProduct ||
  mongoose.model('CatalogProduct', catalogProductSchema);

async function removeMockProducts() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Generate mock product IDs (prod-001 to prod-030)
    const mockProductIds = [];
    for (let i = 1; i <= 30; i++) {
      mockProductIds.push(`prod-${String(i).padStart(3, '0')}`);
    }

    console.log(`\n🔍 Looking for ${mockProductIds.length} mock products to remove...`);

    // Find mock products
    const foundProducts = await CatalogProduct.find({ id: { $in: mockProductIds } });
    console.log(`📦 Found ${foundProducts.length} mock products in database`);

    if (foundProducts.length === 0) {
      console.log('✨ No mock products found in database. Nothing to remove.');
      return;
    }

    // Show what will be deleted
    console.log('\n📋 Products to be deleted:');
    foundProducts.forEach((p) => {
      console.log(`   - ${p.id}: ${p.title} (${p.slug})`);
    });

    // Delete mock products
    console.log(`\n🗑️  Deleting ${foundProducts.length} mock products...`);
    const result = await CatalogProduct.deleteMany({ id: { $in: mockProductIds } });
    console.log(`✅ Successfully deleted ${result.deletedCount} products`);

    // Check remaining products
    const remaining = await CatalogProduct.countDocuments();
    console.log(`\n📊 Remaining products in database: ${remaining}`);

    if (remaining > 0) {
      const remainingProducts = await CatalogProduct.find().limit(10).select('id title slug');
      console.log('\n📦 Sample remaining products:');
      remainingProducts.forEach((p) => {
        console.log(`   - ${p.id}: ${p.title} (${p.slug})`);
      });
      if (remaining > 10) {
        console.log(`   ... and ${remaining - 10} more`);
      }
    }
  } catch (error) {
    console.error('❌ Error removing mock products:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

removeMockProducts()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
