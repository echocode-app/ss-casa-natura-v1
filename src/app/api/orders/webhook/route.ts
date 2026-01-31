import { NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { getStripe } from '@/lib/stripe/server';
import connectToDB from '@/lib/db/mongo';
import Order from '@/lib/db/models/Order';
import CheckoutDraft from '@/lib/db/models/CheckoutDraft';
import mongoose from 'mongoose';
import { finalizePaidOrderOnce } from '@/lib/checkout/finalizePaidOrder';

export const runtime = 'nodejs';

export const POST = handleApi(async (req: Request) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { received: false, error: 'Stripe webhook secret not configured' },
      { status: 400 },
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ received: false, error: 'Missing signature' }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: any;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    return NextResponse.json(
      { received: false, error: err?.message || 'Invalid signature' },
      { status: 400 },
    );
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent?.metadata?.orderId;
    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ received: true });
    }

    await connectToDB();

    let order: any = await Order.findById(orderId).lean();
    if (!order) {
      const draft: any = await CheckoutDraft.findOne({ orderId }).lean();
      if (draft) {
        await Order.create({
          _id: new mongoose.Types.ObjectId(orderId),
          userId: draft.userId,
          status: 'paid',
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
          paidAt: new Date(),
          products: (draft.products || []).map((p: any) => ({
            productId: p.productId,
            variantId: p.variantId,
            slug: p.slug,
            title: p.title,
            imageSrc: p.imageSrc,
            price: p.price,
            quantity: p.quantity,
            volume: p.volume,
            unit: p.unit,
          })),
        });
      }
    } else {
      await Order.updateOne(
        { _id: order._id },
        {
          $set: {
            status: 'paid',
            paidAt: new Date(),
            stripePaymentIntentId: paymentIntent.id,
          },
        },
      );
    }

    await finalizePaidOrderOnce({ orderId, paymentIntent });
    await CheckoutDraft.deleteOne({ orderId });
  }

  return NextResponse.json({ received: true });
});
