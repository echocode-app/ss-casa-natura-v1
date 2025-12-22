import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import Product from '@/lib/db/models/Product';
import { log } from '@/lib/utils/logger';
import { sendEmail } from '@/lib/utils/sendEmail';
import { orderConfirmationTemplate } from '@/lib/emailTemplates/orderConfirmation';
import { newOrderAdminTemplate } from '@/lib/emailTemplates/newOrderAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export const POST = async (req: NextRequest) => {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    log('error', '⚠️ Webhook signature verification failed', err.message);
    return NextResponse.json({ received: false }, { status: 400 });
  }

  await connectToDB();

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const order = await Order.findOne({ paymentIntentId: paymentIntent.id }).populate(
      'products.productId',
    );

    if (!order) {
      log('error', `Order not found for PaymentIntent ${paymentIntent.id}`);
      return NextResponse.json({ received: true });
    }

    if (order.status === 'paid') {
      log('info', `Order ${order._id} already marked as paid`);
      return NextResponse.json({ received: true });
    }

    // Update stock
    for (const item of order.products) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = Math.max(product.stock - item.quantity, 0);
        await product.save();
      }
    }

    // Update order status
    order.status = 'paid';
    order.updatedAt = new Date();
    await order.save();

    log('success', `Order ${order._id} marked as paid`);

    // Send emails
    try {
      await sendEmail({
        to: order.userId.email,
        subject: 'Pagamento confermato ✅',
        text: orderConfirmationTemplate({
          userName: order.userId.name,
          orderId: order._id.toString(),
          totalAmount: order.totalAmount,
          deliveryPrice: order.deliveryPrice,
          status: order.status,
          products: order.products.map((p: any) => ({
            name: (p.productId as any).name,
            quantity: p.quantity,
            price: p.priceAtPurchase,
          })),
        }),
      });
      log('success', `Order payment confirmation sent to user ${order.userId.email}`);

      await sendEmail({
        to: process.env.ADMIN_EMAIL!,
        subject: 'Ordine pagato 🟢',
        text: newOrderAdminTemplate({
          orderId: order._id.toString(),
          userEmail: order.userId.email,
          totalAmount: order.totalAmount,
          products: order.products.map((p: any) => ({
            name: (p.productId as any).name,
            quantity: p.quantity,
            price: p.priceAtPurchase,
          })),
        }),
      });
      log('success', `Order payment notification sent to admin`);
    } catch (err: any) {
      log('error', 'Failed to send payment confirmation emails', err);
    }
  }

  return NextResponse.json({ received: true });
};
