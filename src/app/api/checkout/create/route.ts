import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import CheckoutDraft from '@/lib/db/models/CheckoutDraft';
import SiteSettings from '@/lib/db/models/SiteSettings';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { calculateShippingQuote } from '@/lib/checkout/shipping';
import { priceItems } from '@/lib/checkout/pricing';
import { getStripe } from '@/lib/stripe/server';
import { buildCartQuery } from '@/lib/utils/cartQuery';
import { computePromoDiscount } from '@/lib/utils/promo';
import { checkItemsInStock } from '@/lib/utils/inventory';
import { computeGlobalPromotionDiscount } from '@/lib/utils/globalPromotion';
import { getCartExpirationDate, extendCartExpiration } from '@/lib/constants/cart';

const itemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

const schema = z.object({
  customer: z.object({
    email: z.string().email().max(320),
    name: z.string().min(1).max(120),
    surname: z.string().max(120).optional(),
    phone: z.string().max(40).optional(),
  }),
  address: z.object({
    country: z.string().regex(/^[A-Za-z]{2}$/),
    city: z.string().min(1).max(120),
    postalCode: z.string().min(2).max(20),
    addressLine1: z.string().min(1).max(200),
    company: z.string().max(120).optional(),
    addressLine2: z.string().max(200).optional(),
    province: z.string().max(120).optional(),
  }),
  marketingOptIn: z.boolean().optional(),
  shippingMethod: z.enum(['one_time', 'recurring_4w']).optional(),
  items: z.array(itemSchema).max(50).optional(),
  promoCode: z.string().min(1).max(50).optional(),
  promoDiscount: z.number().finite().min(0).max(1_000_000).optional(),
});

function toCents(amount: number): number {
  return Math.max(0, Math.round(amount * 100));
}

function promoError(reason: string): { status: number; errorCode: string; error: string } {
  switch (reason) {
    case 'email_mismatch':
      return {
        status: 400,
        errorCode: 'PROMO_EMAIL_MISMATCH',
        error: "Questo codice e' valido solo per questa email",
      };
    case 'used':
      return {
        status: 400,
        errorCode: 'PROMO_ALREADY_USED_BY_EMAIL',
        error: 'Hai già utilizzato questo codice promozionale',
      };
    case 'not_active':
      return {
        status: 400,
        errorCode: 'PROMO_NOT_ACTIVE_YET',
        error: 'Questo codice non è ancora attivo',
      };
    case 'expired':
      return { status: 400, errorCode: 'PROMO_EXPIRED', error: 'Questo codice è scaduto' };
    case 'usage_limit':
      return {
        status: 400,
        errorCode: 'PROMO_USAGE_LIMIT_REACHED',
        error: 'Questo codice ha raggiunto il limite di utilizzi',
      };
    case 'invalid':
    default:
      return { status: 404, errorCode: 'PROMO_NOT_FOUND', error: 'Codice promozionale non valido' };
  }
}

export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

  let stripe;
  try {
    stripe = getStripe();
  } catch (e: any) {
    if (e?.code === 'STRIPE_NOT_CONFIGURED') {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'STRIPE_NOT_CONFIGURED',
          error: 'Stripe is not configured',
        },
        { status: 503 },
      );
    }
    throw e;
  }

  const idempotencyKeyHeader =
    req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key') || undefined;
  const idempotencyKey =
    idempotencyKeyHeader && idempotencyKeyHeader.trim().length >= 8
      ? idempotencyKeyHeader.trim().slice(0, 128)
      : undefined;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      { success: false, error: first?.message || 'Validation failed' },
      { status: 400 },
    );
  }

  const sessionId = await getCartSessionId();
  const userId = await getUserIdFromRequest(req);

  const cartQuery = buildCartQuery({ userId, sessionId });
  const cart = cartQuery ? await Cart.findOne(cartQuery) : null;

  const items = (cart?.items?.length ? cart.items : parsed.data.items) || [];
  if (!items.length) {
    return NextResponse.json({ success: false, error: 'Cart is empty' }, { status: 400 });
  }

  // Final availability check (seller stock) before pricing/payment
  const stockCheck = await checkItemsInStock(
    items.map((i: any) => ({
      productId: String(i.productId),
      variantId: String(i.variantId),
      quantity: Number(i.quantity) || 1,
    })),
  );

  if (!stockCheck.ok) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'OUT_OF_STOCK',
        error: 'Some items are out of stock',
        details: { items: stockCheck.issues },
      },
      { status: 409 },
    );
  }

  const { pricedItems, subtotal, totalWeightKg } = await priceItems(
    items.map((i: any) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })),
  );

  const normalizedEmail = parsed.data.customer.email.trim().toLowerCase();

  const promoCodeFromCart = cart?.promoCode || undefined;
  const promoEmailFromCart = (cart as any)?.promoEmail || undefined;
  const promoCodeFromRequest = cart ? undefined : parsed.data.promoCode || undefined;

  let promoCode: string | undefined = promoCodeFromCart || promoCodeFromRequest;
  let promoDiscount = 0;

  if (promoCode) {
    const promoResult = await computePromoDiscount({
      promoCode,
      subtotal,
      email: normalizedEmail,
      expectedEmail: promoEmailFromCart,
      ignoreIssuedToEmail: !userId,
    });

    if (promoResult.ok) {
      promoCode = promoResult.promoCode;
      promoDiscount = promoResult.promoDiscount;
    } else {
      if (!promoCodeFromCart) {
        const mapped = promoError(promoResult.reason);
        return NextResponse.json(
          { success: false, errorCode: mapped.errorCode, error: mapped.error },
          { status: mapped.status },
        );
      }
      promoCode = undefined;
      promoDiscount = 0;

      // Keep cart consistent if promo became invalid / email mismatch.
      if (cart) {
        await Cart.updateOne(
          { _id: cart._id },
          { $set: { promoCode: undefined, promoEmail: undefined, promoDiscount: 0 } },
        );
      }
    }
  }

  const settingsDoc = await SiteSettings.findOne({ key: 'default' }).lean();
  const shipping = calculateShippingQuote(
    {
      subtotal: Math.max(0, subtotal - promoDiscount),
      totalWeightKg,
      address: parsed.data.address,
    },
    settingsDoc?.shipping,
  );

  const shippingMethod = parsed.data.shippingMethod || 'one_time';
  const effectiveShippingPrice =
    shippingMethod === 'recurring_4w' ? shipping.recurringPrice : shipping.shippingPrice;
  const total = Math.round((subtotal - promoDiscount + effectiveShippingPrice) * 100) / 100;
  const amountCents = toCents(total);

  const userObjectId =
    userId && mongoose.Types.ObjectId.isValid(userId)
      ? new mongoose.Types.ObjectId(userId)
      : undefined;

  if (idempotencyKey) {
    const existing = await CheckoutDraft.findOne({ checkoutId: idempotencyKey }).lean();
    if (existing?.stripePaymentIntentId && existing.status !== 'paid') {
      const pi = await stripe.paymentIntents.retrieve(existing.stripePaymentIntentId);
      const clientSecret = (pi as any).client_secret;
      if (clientSecret) {
        return NextResponse.json({
          success: true,
          clientSecret,
          orderId: String(existing.orderId),
          amount: existing.totalPrice || total,
          currency: 'EUR',
        });
      }
    }
  }

  const orderId = new mongoose.Types.ObjectId().toString();

  if (!cart && sessionId) {
    const isAuthenticated = !!userId;
    const draftItems = pricedItems.map((p) => ({
      productId: String(p.productId),
      variantId: String(p.variantId),
      slug: p.slug,
      sku: p.sku,
      title: p.title,
      imageSrc: p.imageSrc,
      price: p.price,
      quantity: p.quantity,
      volume: p.volume,
      unit: p.unit,
      totalPrice: p.price * p.quantity,
    }));

    const discount = await computeGlobalPromotionDiscount({
      items: draftItems.map((i) => ({
        productId: String(i.productId),
        totalPrice: i.totalPrice,
      })),
      subtotal,
    });

    await Cart.findOneAndUpdate(
      { sessionId, userId: userId || { $exists: false } },
      {
        $set: {
          userId: userId || undefined,
          sessionId,
          items: draftItems,
          subtotal,
          discount,
          promoCode,
          promoDiscount,
          total: subtotal - discount - promoDiscount,
          expiresAt: getCartExpirationDate(isAuthenticated),
        },
      },
      { upsert: true, new: true },
    );
  } else if (cart) {
    const isAuthenticated = !!cart.userId;
    cart.expiresAt = extendCartExpiration(isAuthenticated);
    await cart.save();
  }

  let draft: any;
  try {
    draft = await CheckoutDraft.findOneAndUpdate(
      idempotencyKey ? { checkoutId: idempotencyKey } : { orderId },
      {
        $setOnInsert: {
          orderId,
          checkoutId: idempotencyKey,
        },
        $set: {
          userId: userObjectId,
          sessionId: sessionId || undefined,
          status: 'open',
          currency: 'EUR',
          subtotal,
          shippingPrice: effectiveShippingPrice,
          totalPrice: total,
          promoCode,
          promoDiscount,

          customerEmail: normalizedEmail,
          customerName: parsed.data.customer.name,
          customerSurname: parsed.data.customer.surname,
          customerPhone: parsed.data.customer.phone,
          shippingAddress: parsed.data.address,
          shippingMethod,
          marketingOptIn: parsed.data.marketingOptIn || false,

          products: pricedItems.map((p) => ({
            productId: String(p.productId),
            variantId: String(p.variantId),
            slug: p.slug,
            sku: p.sku,
            title: p.title,
            imageSrc: p.imageSrc,
            price: p.price,
            quantity: p.quantity,
            volume: p.volume,
            unit: p.unit,
          })),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      { new: true, upsert: true },
    ).lean();
  } catch (e: any) {
    // Unique checkoutId collision: fetch existing draft
    if (idempotencyKey && e?.code === 11000) {
      const existing = await CheckoutDraft.findOne({ checkoutId: idempotencyKey }).lean();
      if (existing?.stripePaymentIntentId) {
        const pi = await stripe.paymentIntents.retrieve(existing.stripePaymentIntentId);
        return NextResponse.json({
          success: true,
          clientSecret: (pi as any).client_secret,
          orderId: String(existing.orderId),
          amount: existing.totalPrice || total,
          currency: 'EUR',
        });
      }
    }
    throw e;
  }

  const paymentIntent = await stripe.paymentIntents.create(
    {
      amount: amountCents,
      currency: 'eur',
      receipt_email: normalizedEmail,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'always',
      },
      shipping: {
        name: `${parsed.data.customer.name}${parsed.data.customer.surname ? ` ${parsed.data.customer.surname}` : ''}`,
        phone: parsed.data.customer.phone || undefined,
        address: {
          line1: parsed.data.address.addressLine1,
          line2: parsed.data.address.addressLine2 || undefined,
          city: parsed.data.address.city,
          state: parsed.data.address.province || undefined,
          postal_code: parsed.data.address.postalCode,
          country: parsed.data.address.country.toUpperCase(),
        },
      },
      metadata: {
        orderId: String(draft.orderId),
        sessionId: sessionId || '',
        userId: userId || '',
        checkoutId: idempotencyKey || '',
      },
    },
    idempotencyKey ? { idempotencyKey } : undefined,
  );

  await CheckoutDraft.findOneAndUpdate(
    { _id: draft._id },
    { $set: { stripePaymentIntentId: paymentIntent.id } },
  );

  return NextResponse.json({
    success: true,
    clientSecret: paymentIntent.client_secret,
    orderId: String(draft.orderId),
    amount: total,
    currency: 'EUR',
  });
});
