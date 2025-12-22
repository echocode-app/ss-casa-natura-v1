import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import Product from '@/lib/db/models/Product';
import Order from '@/lib/db/models/Order';
import PromoCode from '@/lib/db/models/PromoCode';
import jwt from 'jsonwebtoken';
import Stripe from 'stripe';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';
import { sendEmail } from '@/lib/utils/sendEmail';
import { orderConfirmationTemplate } from '@/lib/emailTemplates/orderConfirmation';
import { newOrderAdminTemplate } from '@/lib/emailTemplates/newOrderAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-12-15.clover' });

interface IOrderProduct {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

const handler = handleApi(async (req: NextRequest) => {
  await connectToDB();

  if (req.method !== 'POST')
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });

  // Auth
  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
  const { products, promoCode, deliveryOption } = await req.json();

  if (!products || products.length === 0)
    return NextResponse.json({ error: 'No products in order' }, { status: 400 });

  // Fetch products from DB
  const productIds = products.map((p: any) => p.productId);
  const dbProducts = await Product.find({ _id: { $in: productIds } });

  // Build orderProducts with proper typing
  let totalAmount = 0;
  const orderProducts: IOrderProduct[] = products.map((p: any) => {
    const dbProduct = dbProducts.find((dp) => dp._id.toString() === p.productId);
    if (!dbProduct) throw new Error(`Product not found: ${p.productId}`);
    if (dbProduct.stock < p.quantity) throw new Error(`Not enough stock for ${dbProduct.name}`);

    let price = dbProduct.promoPrice ?? dbProduct.price;
    if (dbProduct.seasonalDiscount) price *= 1 - dbProduct.seasonalDiscount / 100;

    totalAmount += price * p.quantity;

    return {
      productId: dbProduct._id.toString(),
      quantity: p.quantity,
      priceAtPurchase: price,
    };
  });

  // Apply promo code
  if (promoCode) {
    const promo = await PromoCode.findOne({ code: promoCode });
    if (!promo) return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 });

    if (promo.type === 'percentage') totalAmount *= 1 - promo.value / 100;
    else totalAmount -= promo.value;

    log('success', `Promo applied: ${promo.code}`);
  }

  // Delivery calculation
  let deliveryPrice = 0;
  const totalWeight = dbProducts.reduce((sum, p) => sum + (p.weight ?? 0), 0);
  if (deliveryOption === 'standard') deliveryPrice = totalWeight * 2;
  else if (deliveryOption === 'express') deliveryPrice = totalWeight * 4;

  totalAmount += deliveryPrice;

  // Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalAmount * 100),
    currency: 'eur',
    metadata: { userId: payload.id },
  });

  // Save order
  const order = await Order.create({
    userId: payload.id,
    products: orderProducts,
    totalAmount,
    deliveryPrice,
    status: 'pending',
    paymentIntentId: paymentIntent.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  log('info', `Order created: ${order._id} by user ${payload.id}`);

  // Send emails
  try {
    await sendEmail({
      to: payload.email,
      subject: 'Order Confirmation',
      text: orderConfirmationTemplate({
        userName: payload.name,
        orderId: order._id.toString(),
        totalAmount,
        deliveryPrice,
        status: order.status,
        products: orderProducts.map((p) => {
          const prod = dbProducts.find((dp) => dp._id.toString() === p.productId)!;
          return {
            name: prod.name,
            quantity: p.quantity,
            price: p.priceAtPurchase,
          };
        }),
      }),
    });
    log('success', `Order confirmation sent to user ${payload.email}`);

    await sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: 'New Order Received',
      text: newOrderAdminTemplate({
        orderId: order._id.toString(),
        userEmail: payload.email,
        totalAmount,
        products: orderProducts.map((p) => {
          const prod = dbProducts.find((dp) => dp._id.toString() === p.productId)!;
          return {
            name: prod.name,
            quantity: p.quantity,
            price: p.priceAtPurchase,
          };
        }),
      }),
    });
    log('success', 'New order notification sent to admin');
  } catch (err: any) {
    log('error', 'Failed to send order emails', err);
  }

  return NextResponse.json({
    message: 'Order created',
    clientSecret: paymentIntent.client_secret,
    orderId: order._id,
  });
});

export const POST = handler;
