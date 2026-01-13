#!/usr/bin/env node

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __scriptdir = dirname(__filename);
const __rootdir = dirname(__scriptdir);

// Load environment variables - try both .env and .env.local
config({ path: join(__rootdir, '.env.local') });
config({ path: join(__rootdir, '.env') });

const { Schema, model } = mongoose;

// Define Product schema inline
const productSchema = new Schema(
  {
    name: String,
    slug: String,
    category: String,
    price: Number,
    stock: Number,
    sku: String,
    images: [String],
    description: String,
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || model('Product', productSchema);

// Mock products data (first 20 products from products.mock.ts)
const mockProducts = [
  { sku: 'art.0000001', slug: 'detersivo-piatti-limone', name: 'Detersivo Piatti Limone', price: 5.5, category: 'detersivi-piatti', description: 'Detersivo piatti ricaricabile' },
  { sku: 'art.0000002', slug: 'cura-lavastoviglie-marsiglia', name: 'Cura Lavastoviglie Marsiglia', price: 4.5, category: 'cura-lavastoviglie', description: 'Cura per lavastoviglie' },
  { sku: 'art.0000003', slug: 'ammorbidente-lavanda', name: 'Ammorbidente Lavanda', price: 6.0, category: 'ammorbidenti', description: 'Ammorbidente con profumo di lavanda' },
  { sku: 'art.0000004', slug: 'detersivo-bucato-fiore-di-loto', name: 'Detersivo Bucato Fiore di Loto', price: 7.0, category: 'detersivi-bucato', description: 'Detersivo per bucato' },
  { sku: 'art.0000005', slug: 'sgrassatore-neutro', name: 'Sgrassatore Neutro', price: 3.0, category: 'sgrassatori', description: 'Sgrassatore universale' },
  { sku: 'art.0000006', slug: 'lavapavimenti-brezza-marina', name: 'Lavapavimenti Brezza Marina', price: 8.0, category: 'lavapavimenti', description: 'Detergente per pavimenti' },
  { sku: 'art.0000007', slug: 'detersivo-piatti-limone-ricarica', name: 'Detersivo Piatti Limone Ricarica', price: 4.8, category: 'detersivi-piatti', description: 'Ricarica detersivo piatti' },
  { sku: 'art.0000008', slug: 'cura-lavastoviglie-lavanda', name: 'Cura Lavastoviglie Lavanda', price: 5.0, category: 'cura-lavastoviglie', description: 'Cura lavastoviglie profumata' },
  { sku: 'art.0000009', slug: 'ammorbidente-brezza-marina', name: 'Ammorbidente Brezza Marina', price: 6.5, category: 'ammorbidenti', description: 'Ammorbidente fresco' },
  { sku: 'art.0000010', slug: 'detersivo-bucato-neutro', name: 'Detersivo Bucato Neutro', price: 7.0, category: 'detersivi-bucato', description: 'Detersivo neutro per bucato' },
  { sku: 'art.0000011', slug: 'sgrassatore-agrumi', name: 'Sgrassatore Agrumi', price: 5.0, category: 'sgrassatori', description: 'Sgrassatore agli agrumi' },
  { sku: 'art.0000012', slug: 'lavapavimenti-lavanda', name: 'Lavapavimenti Lavanda', price: 6.0, category: 'lavapavimenti', description: 'Lavapavimenti profumato' },
  { sku: 'art.0000013', slug: 'detersivo-piatti-fiore-di-loto', name: 'Detersivo Piatti Fiore di Loto', price: 4.0, category: 'detersivi-piatti', description: 'Detersivo delicato' },
  { sku: 'art.0000014', slug: 'cura-lavastoviglie-neutro', name: 'Cura Lavastoviglie Neutro', price: 3.5, category: 'cura-lavastoviglie', description: 'Cura neutro' },
  { sku: 'art.0000015', slug: 'ammorbidente-fiore-di-loto', name: 'Ammorbidente Fiore di Loto', price: 6.5, category: 'ammorbidenti', description: 'Ammorbidente delicato' },
  { sku: 'art.0000016', slug: 'detersivo-piatti-arancia', name: 'Detersivo Piatti Arancia', price: 15, category: 'detersivi-piatti', description: 'Detersivo agli agrumi' },
  { sku: 'art.0000017', slug: 'cura-lavastoviglie-limone', name: 'Cura Lavastoviglie Limone', price: 10, category: 'cura-lavastoviglie', description: 'Cura al limone' },
  { sku: 'art.0000018', slug: 'ammorbidente-marsiglia', name: 'Ammorbidente Marsiglia', price: 25, category: 'ammorbidenti', description: 'Ammorbidente classico' },
  { sku: 'art.0000019', slug: 'detersivo-bucato-brezza', name: 'Detersivo Bucato Brezza Marina', price: 18, category: 'detersivi-bucato', description: 'Detersivo fresco' },
  { sku: 'art.0000020', slug: 'sgrassatore-limone', name: 'Sgrassatore Limone', price: 12, category: 'sgrassatori', description: 'Sgrassatore al limone' },
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to database');

    // Check if products already exist
    const existingCount = await Product.countDocuments();
    console.log(`📊 Current products in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log('\n⚠️  Products already exist. Delete them first? (y/n)');
      // For automated script, we'll just proceed
      console.log('Proceeding with import...\n');
    }

    // Import products
    let imported = 0;
    let skipped = 0;

    for (const productData of mockProducts) {
      const existing = await Product.findOne({ sku: productData.sku });
      
      if (existing) {
        console.log(`⏭️  Skipped: ${productData.name} (already exists)`);
        skipped++;
      } else {
        await Product.create({
          ...productData,
          stock: 100,
          images: ['/images/home/product.png'],
        });
        console.log(`✅ Imported: ${productData.name}`);
        imported++;
      }
    }

    console.log(`\n🎉 Import completed!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total in DB: ${await Product.countDocuments()}`);

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding products:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedProducts();
