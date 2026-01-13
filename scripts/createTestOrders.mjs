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
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        products: [orderProductSchema],
        status: { type: String, enum: ['pending', 'paid', 'shipped', 'canceled'], default: 'pending' },
        totalPrice: Number,
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
            // Order 1: 1 position, 3 units
            {
                userId: user._id,
                products: [
                    { productId: products[0]._id, quantity: 3 }, // Detersivo Piatti Limone
                ],
                status: 'paid',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
            },
            // Order 2: 5 positions with various quantities
            {
                userId: user._id,
                products: [
                    { productId: products[1]._id, quantity: 2 }, // Cura Lavastoviglie
                    { productId: products[3]._id, quantity: 1 }, // Detersivo Bucato
                    { productId: products[5]._id, quantity: 4 }, // Lavapavimenti
                    { productId: products[8]._id, quantity: 3 }, // Ammorbidente
                    { productId: products[10]._id, quantity: 2 }, // Sgrassatore
                ],
                status: 'shipped',
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            },
            // Order 3: 20 positions with various quantities
            {
                userId: user._id,
                products: [
                    { productId: products[0]._id, quantity: 2 },
                    { productId: products[1]._id, quantity: 1 },
                    { productId: products[2]._id, quantity: 3 },
                    { productId: products[3]._id, quantity: 1 },
                    { productId: products[4]._id, quantity: 2 },
                    { productId: products[5]._id, quantity: 4 },
                    { productId: products[6]._id, quantity: 1 },
                    { productId: products[7]._id, quantity: 2 },
                    { productId: products[8]._id, quantity: 3 },
                    { productId: products[9]._id, quantity: 1 },
                    { productId: products[10]._id, quantity: 5 },
                    { productId: products[11]._id, quantity: 2 },
                    { productId: products[12]._id, quantity: 1 },
                    { productId: products[13]._id, quantity: 3 },
                    { productId: products[14]._id, quantity: 2 },
                    { productId: products[15]._id, quantity: 1 },
                    { productId: products[16]._id, quantity: 4 },
                    { productId: products[17]._id, quantity: 2 },
                    { productId: products[18]._id, quantity: 1 },
                    { productId: products[19]._id, quantity: 3 },
                ],
                status: 'pending',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            },
        ];

        // Calculate total prices
        ordersData.forEach(order => {
            order.totalPrice = calculateTotal(order.products);
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
