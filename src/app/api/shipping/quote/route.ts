import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { calculateShippingQuote } from '@/lib/checkout/shipping';
import { priceItems } from '@/lib/checkout/pricing';
import { buildCartQuery } from '@/lib/utils/cartQuery';

const itemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

const schema = z.object({
  address: z.object({
    country: z.string().min(2),
    postalCode: z.string().min(2),
    city: z.string().optional(),
    addressLine1: z.string().optional(),
    addressLine2: z.string().optional(),
    province: z.string().optional(),
  }),
  items: z.array(itemSchema).optional(),
  promoCode: z.string().min(1).max(50).optional(),
  promoDiscount: z.number().finite().min(0).max(1_000_000).optional(),
});

export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

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

  const { subtotal, totalWeightKg } = await priceItems(
    items.map((i: any) => ({
      productId: i.productId,
      variantId: i.variantId,
      quantity: i.quantity,
    })),
  );

  const promoDiscount = cart?.promoDiscount
    ? Math.max(0, cart.promoDiscount)
    : Math.min(subtotal, Math.max(0, Number(parsed.data.promoDiscount || 0)));

  const shipping = calculateShippingQuote({
    subtotal: Math.max(0, subtotal - promoDiscount),
    totalWeightKg,
    address: parsed.data.address,
  });

  const total = Math.round((subtotal - promoDiscount + shipping.shippingPrice) * 100) / 100;

  return NextResponse.json({
    success: true,
    quote: {
      currency: 'EUR',
      shippingPrice: shipping.shippingPrice,
      subtotal,
      promoDiscount,
      total,
      totalWeightKg,
    },
  });
});
