#!/usr/bin/env node

import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __scriptdir = dirname(__filename);
const __rootdir = dirname(__scriptdir);

config({ path: join(__rootdir, '.env.local') });
config({ path: join(__rootdir, '.env') });

const { Schema, model } = mongoose;

// Define schemas inline
const userSchema = new Schema({
    name: String,
    surname: String,
    email: String,
    passwordHash: String,
    phone: String,
    deliveryAddress: String,
    role: String,
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    verified: Boolean,
    createdAt: Date,
    updatedAt: Date,
});

const orderProductSchema = new Schema(
    {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        volume: { type: Number },
        unit: { type: String },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        products: [orderProductSchema],
        status: { type: String, enum: ['pending', 'paid', 'shipped', 'canceled'], default: 'pending' },
        subtotal: Number,
        totalPrice: Number,
        promoCode: String,
        discount: Number,
        promoDiscount: Number,
    },
    { timestamps: true }
);

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

const User = mongoose.models.User || model('User', userSchema);
const Order = mongoose.models.Order || model('Order', orderSchema);
const Product = mongoose.models.Product || model('Product', productSchema);

async function createTestOrders() {
    try {
        // Connect to MongoDB
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }

    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
        const userEmail = 'test1768167552430@example.com';
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            console.error(`❌ User not found: ${userEmail}`);
            process.exit(1);
        }

        console.log(`✅ Found user: ${user.email} (${user._id})`);

        // Remove previous test orders for a clean slate
        await Order.deleteMany({ userId: user._id });
        user.orders = [];
        await user.save();
        console.log('🗑️ Cleared previous orders for user');

        // Get products from database (expect mock products to be already seeded)
        const products = await Product.find().limit(30);

        if (products.length === 0) {
            console.error('❌ No products found in database. Please seed products first.');
            process.exit(1);
        }

        console.log(`✅ Found ${products.length} products`);

        // Helper to calculate total price
        const calculateTotal = (items) => {
            return items.reduce((sum, item) => {
                const product = products.find(p => p._id.equals(item.productId));
                return sum + (product ? product.price * item.quantity : 0);
            }, 0);
        };

        // Create 3 test orders with different sizes
        const ordersData = [
            // Order 1: 1 position, 3 units (з volume і unit)
            {
                userId: user._id,
                products: [
                    { 
                        productId: products[0]._id, 
                        quantity: 3,
                        volume: products[0].volume || 500,
                        unit: products[0].properties?.get?.('unit') || 'ml'
                    },
                ],
                status: 'paid',
                // No promo/discount to test absence
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
            // Order 2: 5 positions with various quantities (деякі з volume і unit)
            {
                userId: user._id,
                products: [
                    { 
                        productId: products[1]._id, 
                        quantity: 2,
                        volume: products[1].volume || 250,
                        unit: products[1].properties?.get?.('unit') || 'ml'
                    },
                    { 
                        productId: products[3]._id, 
                        quantity: 1,
                        volume: products[3].volume || 500,
                        unit: products[3].properties?.get?.('unit') || 'ml'
                    },
                    { 
                        productId: products[5]._id, 
                        quantity: 4,
                        volume: products[5].volume || 750,
                        unit: products[5].properties?.get?.('unit') || 'ml'
                    },
                    { 
                        productId: products[8]._id, 
                        quantity: 3
                        // без volume і unit для перевірки
                    },
                    { 
                        productId: products[10]._id, 
                        quantity: 2
                        // без volume і unit для перевірки
                    },
                ],
                status: 'shipped',
                promoCode: 'WELCOME10',
                // 10% promo from subtotal (computed later)
                promoDiscount: 0,
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            },
            // Order 3: 20 positions with various quantities (випадково додаємо volume і unit)
            {
                userId: user._id,
                products: [
                    { productId: products[0]._id, quantity: 2, volume: products[0].volume || 100, unit: 'ml' },
                    { productId: products[1]._id, quantity: 1 },
                    { productId: products[2]._id, quantity: 3, volume: products[2].volume || 200, unit: 'ml' },
                    { productId: products[3]._id, quantity: 1 },
                    { productId: products[4]._id, quantity: 2, volume: products[4].volume || 300, unit: 'ml' },
                    { productId: products[5]._id, quantity: 4 },
                    { productId: products[6]._id, quantity: 1, volume: products[6].volume || 400, unit: 'ml' },
                    { productId: products[7]._id, quantity: 2 },
                    { productId: products[8]._id, quantity: 3, volume: products[8].volume || 500, unit: 'ml' },
                    { productId: products[9]._id, quantity: 1 },
                    { productId: products[10]._id, quantity: 5, volume: products[10].volume || 1000, unit: 'l' },
                    { productId: products[11]._id, quantity: 2 },
                    { productId: products[12]._id, quantity: 1, volume: products[12].volume || 600, unit: 'ml' },
                    { productId: products[13]._id, quantity: 3 },
                    { productId: products[14]._id, quantity: 2, volume: products[14].volume || 700, unit: 'ml' },
                    { productId: products[15]._id, quantity: 1 },
                    { productId: products[16]._id, quantity: 4, volume: products[16].volume || 800, unit: 'ml' },
                    { productId: products[17]._id, quantity: 2 },
                    { productId: products[18]._id, quantity: 1, volume: products[18].volume || 900, unit: 'ml' },
                    { productId: products[19]._id, quantity: 3 },
                ],
                status: 'pending',
                promoCode: 'VIP15',
                promoDiscount: 0,
                // Additional flat discount (e.g. seasonal)
                discount: 0,
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
        ];

        // Calculate totals (subtotal -> apply discount amounts)
        ordersData.forEach(order => {
            const subtotal = calculateTotal(order.products);

            // If promoCode present and promoDiscount not explicitly set, default it
            // WELCOME10 -> 10%, VIP15 -> 15%
            if (order.promoCode && (!order.promoDiscount || order.promoDiscount === 0)) {
                const percent = order.promoCode === 'VIP15' ? 15 : 10;
                order.promoDiscount = Math.round((subtotal * percent) / 100 * 100) / 100;
            }

            // Example: add a small extra discount amount for VIP order
            if (order.promoCode === 'VIP15' && (!order.discount || order.discount === 0)) {
                order.discount = 2.5;
            }

            const discount = order.discount || 0;
            const promoDiscount = order.promoDiscount || 0;

            order.subtotal = subtotal;
            order.totalPrice = Math.max(0, subtotal - discount - promoDiscount);
        });

        // Create orders
        const createdOrders = [];
        for (const orderData of ordersData) {
            const order = await Order.create(orderData);
            createdOrders.push(order);
            console.log(`✅ Created order: ${order._id} (${order.status}, ${order.products.length} products, €${order.totalPrice.toFixed(2)})`);
        }

        // Update user's orders array
        user.orders = [...(user.orders || []), ...createdOrders.map((order) => order._id)];
        await user.save();

        console.log('\n🎉 Successfully created 3 test orders for user:', userEmail);
        console.log('Order IDs:', createdOrders.map((o) => o._id.toString()).join(', '));

        await mongoose.connection.close();
        console.log('\n✅ Database connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating test orders:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

createTestOrders();
