import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { env } from '@/lib/env';
import { stripe } from '@/lib/stripe/server';
import Order from '@/lib/db/models/Order';
import CheckoutDraft from '@/lib/db/models/CheckoutDraft';
import mongoose from 'mongoose';
import { finalizePaidOrderOnce } from '@/lib/checkout/finalizePaidOrder';

export const runtime = 'nodejs';

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

    let order: any = null;

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId).lean();
    }

    if (!order) {
      order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id }).lean();
    }

    if (!order) {
      const draft =
        orderId && typeof orderId === 'string'
          ? await CheckoutDraft.findOne({ orderId }).lean()
          : await CheckoutDraft.findOne({ stripePaymentIntentId: paymentIntent.id }).lean();

      if (draft && draft.orderId && mongoose.Types.ObjectId.isValid(String(draft.orderId))) {
        try {
          await Order.create({
            _id: new mongoose.Types.ObjectId(String(draft.orderId)),
            userId: draft.userId,
            status: 'pending',
            currency: draft.currency || 'EUR',
            subtotal: draft.subtotal,
            shippingPrice: draft.shippingPrice,
            totalPrice: draft.totalPrice,
            promoCode: draft.promoCode,
            promoDiscount: draft.promoDiscount,
            checkoutId: draft.checkoutId,
            customerEmail: draft.customerEmail,
            customerName: draft.customerName,
            customerSurname: draft.customerSurname,
            customerPhone: draft.customerPhone,
            shippingAddress: draft.shippingAddress,
            shippingMethod: draft.shippingMethod,
            marketingOptIn: draft.marketingOptIn,
            stripePaymentIntentId: paymentIntent.id,
            products: (draft.products || []).map((p: any) => ({
              productId: p.productId,
              variantId: p.variantId,
              slug: p.slug,
              sku: p.sku,
              title: p.title,
              imageSrc: p.imageSrc,
              price: p.price,
              quantity: p.quantity,
              volume: p.volume,
              unit: p.unit,
            })),
          });
        } catch {
          // ignore duplicate create (race)
        }

        order = await Order.findById(String(draft.orderId)).lean();
      }
    }

    if (!order) return NextResponse.json({ received: true });

    await Order.updateOne(
      { _id: order._id, status: { $ne: 'paid' } },
      {
        $set: {
          status: 'paid',
          paidAt: new Date(),
          stripePaymentIntentId: paymentIntent.id,
        },
      },
    );

    await finalizePaidOrderOnce({ orderId: order._id.toString(), paymentIntent });

    if (orderId) {
      await CheckoutDraft.deleteOne({ orderId: String(orderId) });
    } else {
      await CheckoutDraft.deleteOne({ stripePaymentIntentId: paymentIntent.id });
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

      await CheckoutDraft.findOneAndUpdate(
        { orderId: String(orderId), status: { $ne: 'paid' } },
        { $set: { status: 'failed' } },
      );
    } else {
      await Order.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id, status: 'pending' },
        { $set: { status: 'canceled' } },
      );

      await CheckoutDraft.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id, status: { $ne: 'paid' } },
        { $set: { status: 'failed' } },
      );
    }
  }

  return NextResponse.json({ received: true });
});
