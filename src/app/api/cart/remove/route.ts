import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { RemoveFromCartRequest, CartItemDB } from '@/types/cart';
import { extendCartExpiration } from '@/lib/constants/cart';
import { z } from 'zod';
import { buildCartQuery } from '@/lib/utils/cartQuery';
import { computePromoDiscount } from '@/lib/utils/promo';

const removeFromCartSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

// POST /api/cart/remove - Remove item from cart
export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

  // Parse and validate request body
  let body: RemoveFromCartRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errorCode: 'INVALID_JSON', error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const validation = removeFromCartSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'VALIDATION_FAILED',
        error: 'Validation failed',
        details: validation.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const { itemId } = validation.data;

  const sessionId = await getCartSessionId();
  const userId = await getUserIdFromRequest(req);

  const cartQuery = buildCartQuery({ userId, sessionId });
  if (!cartQuery) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'CART_SESSION_UNAVAILABLE',
        error: 'Cart session not available',
      },
      { status: 400 },
    );
  }

  // Find cart
  const cart = await Cart.findOne(cartQuery);
  if (!cart || !cart.items || cart.items.length === 0) {
    return NextResponse.json(
      { success: false, errorCode: 'CART_NOT_FOUND_OR_EMPTY', error: 'Cart not found or empty' },
      { status: 404 },
    );
  }

  // Remove item
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    (item: CartItemDB) => item._id?.toString() !== itemId && item.id !== itemId,
  );

  if (cart.items.length === initialLength) {
    return NextResponse.json(
      { success: false, errorCode: 'ITEM_NOT_FOUND', error: 'Item not found in cart' },
      { status: 404 },
    );
  }

  // Recalculate totals
  cart.subtotal = cart.items.reduce((sum: number, item: CartItemDB) => sum + item.totalPrice, 0);

  if (cart.promoCode) {
    const promoResult = await computePromoDiscount({
      promoCode: cart.promoCode,
      subtotal: cart.subtotal,
      email: cart.promoEmail,
    });

    if (promoResult.ok) {
      cart.promoCode = promoResult.promoCode;
      cart.promoDiscount = promoResult.promoDiscount;
    } else {
      cart.promoCode = undefined;
      cart.promoEmail = undefined;
      cart.promoDiscount = 0;
    }
  }

  cart.total = cart.subtotal - (cart.discount || 0) - (cart.promoDiscount || 0);

  // Extend expiration on cart activity
  const isAuthenticated = !!cart.userId;
  cart.expiresAt = extendCartExpiration(isAuthenticated);

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
        slug: item.slug,
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
