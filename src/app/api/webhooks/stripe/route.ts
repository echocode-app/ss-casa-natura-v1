import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/server';
import Order from '@/lib/db/models/Order';
import Cart from '@/lib/db/models/Cart';
import MarketingEmail from '@/lib/db/models/MarketingEmail';
import { subscribeToMailchimp } from '@/lib/mailchimp/subscribe';
import { sendEmail } from '@/lib/utils/sendEmail';
import { orderConfirmationTemplate } from '@/lib/emailTemplates/orderConfirmation';
import PromoCode from '@/lib/db/models/PromoCode';
import { logError } from '@/lib/utils/logger';
import { decrementInventoryForOrderProducts } from '@/lib/utils/inventory';

export const POST = handleApi(async (req: NextRequest) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const payload = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhook);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  await connectToDB();

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any;
    const orderId = paymentIntent?.metadata?.orderId;

    // Idempotent update: only one webhook delivery wins.
    const order = orderId
      ? await Order.findOneAndUpdate(
          { _id: orderId, status: { $ne: 'paid' } },
          {
            $set: {
              status: 'paid',
              paidAt: new Date(),
              stripePaymentIntentId: paymentIntent.id,
            },
          },
          { new: true },
        )
      : await Order.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id, status: { $ne: 'paid' } },
          {
            $set: {
              status: 'paid',
              paidAt: new Date(),
            },
          },
          { new: true },
        );

    if (!order) return NextResponse.json({ received: true });

    // Decrement inventory only once (this handler runs only for the webhook winner)
    try {
      const orderProducts = (order.products || []).map((p: any) => ({
        productId: String(p.productId),
        variantId: String(p.variantId),
        quantity: Number(p.quantity) || 1,
      }));

      await decrementInventoryForOrderProducts(orderProducts);
    } catch (e) {
      logError('[stripe webhook] inventory decrement failed', e);
    }

    // Consume promo code only after successful payment (single-use per email)
    if (order.promoCode && order.customerEmail) {
      const code = String(order.promoCode).trim().toUpperCase();
      const email = order.customerEmail.trim().toLowerCase();
      if (code && email) {
        try {
          await PromoCode.updateOne(
            { code, usedByEmails: { $ne: email } },
            { $inc: { usedCount: 1 }, $push: { usedByEmails: email } },
          );
        } catch {
          // ignore promo update failures in webhook
        }
      }
    }

    const sessionId = paymentIntent?.metadata?.sessionId;
    const userId = paymentIntent?.metadata?.userId;

    const cartReset = {
      $set: {
        items: [],
        subtotal: 0,
        discount: 0,
        promoCode: undefined,
        promoEmail: undefined,
        promoDiscount: 0,
        total: 0,
      },
    };

    try {
      if (sessionId) await Cart.findOneAndUpdate({ sessionId }, cartReset);
      if (userId) await Cart.findOneAndUpdate({ userId }, cartReset);
    } catch (e) {
      logError('[stripe webhook] cart reset failed', e);
    }

    const to = order.customerEmail;
    if (to) {
      const products = (order.products || []).map((p: any) => ({
        name: p.title || String(p.productId),
        quantity: p.quantity,
        price: p.price || 0,
      }));

      const text = orderConfirmationTemplate({
        userName: order.customerName || 'Cliente',
        orderId: order._id.toString(),
        totalAmount: order.totalPrice || 0,
        deliveryPrice: order.shippingPrice || 0,
        status: order.status,
        products,
      });

      try {
        await sendEmail({
          to,
          subject: `Conferma ordine ${order._id.toString()}`,
          text,
        });
      } catch {
        // ignore email failures in webhook
      }
    }

    if (order.marketingOptIn && order.customerEmail) {
      const email = order.customerEmail.trim().toLowerCase();
      try {
        await MarketingEmail.findOneAndUpdate(
          { email },
          { email, source: 'checkout' },
          { upsert: true, new: true },
        );
      } catch {
        // ignore
      }

      try {
        await subscribeToMailchimp(email, 'checkout');
      } catch {
        // ignore
      }
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as any;
    const orderId = paymentIntent?.metadata?.orderId;

    // Idempotent transition pending -> canceled
    if (orderId) {
      await Order.findOneAndUpdate(
        { _id: orderId, status: 'pending' },
        { $set: { status: 'canceled' } },
      );
    } else {
      await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id, status: 'pending' },
        { $set: { status: 'canceled' } },
      );
    }
  }

  return NextResponse.json({ received: true });
});
