import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import PromoCode from '@/lib/db/models/PromoCode';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { ApplyPromoCodeRequest, CartItemDB } from '@/types/cart';
import { z } from 'zod';

const applyPromoSchema = z.object({
  promoCode: z.string().min(1, 'Promo code is required'),
});

export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

  let body: ApplyPromoCodeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = applyPromoSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { promoCode } = validation.data;
  const sessionId = await getCartSessionId();
  const userId = await getUserIdFromRequest(req);

  const cart = await Cart.findOne({ $or: [{ userId }, { sessionId }] });
  if (!cart) return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });

  const promo = await PromoCode.findOne({
    code: promoCode.toUpperCase(),
    activeFrom: { $lte: new Date() },
    $and: [
      { $or: [{ activeUntil: { $gte: new Date() } }, { activeUntil: null }] },
      { $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
    ],
  });

  if (!promo)
    return NextResponse.json(
      { success: false, error: 'Invalid or expired promo code' },
      { status: 400 },
    );

  let discount = 0;
  if (promo.type === 'percentage') discount = (cart.subtotal * promo.value) / 100;
  else if (promo.type === 'fixed') discount = Math.min(promo.value, cart.subtotal);

  cart.promoCode = promo.code;
  cart.promoDiscount = discount;
  cart.total = cart.subtotal - discount;

  await cart.save();

  return NextResponse.json({
    success: true,
    cart: {
      id: cart._id.toString(),
      userId: cart.userId,
      sessionId: cart.sessionId,
      items: cart.items.map((item: CartItemDB) => ({
        id: item._id?.toString() || item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        imageSrc: item.imageSrc,
        price: item.price,
        volume: item.volume,
        unit: item.unit,
        quantity: item.quantity,
        totalPrice: item.totalPrice,
      })),
      subtotal: cart.subtotal,
      discount: cart.discount,
      promoCode: cart.promoCode,
      promoDiscount: cart.promoDiscount,
      total: cart.total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    },
  });
});
