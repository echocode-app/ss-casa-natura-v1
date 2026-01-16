import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { CartItemDB } from '@/types/cart';
import { extendCartExpiration } from '@/lib/constants/cart';
import { buildCartQuery } from '@/lib/utils/cartQuery';
import { computeGlobalPromotionDiscount } from '@/lib/utils/globalPromotion';

// POST /api/cart/promo/remove - Remove promo code from cart
export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

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

  if (!cart) {
    return NextResponse.json(
      { success: false, errorCode: 'CART_NOT_FOUND', error: 'Cart not found' },
      { status: 404 },
    );
  }

  // Remove promo code
  cart.promoCode = undefined;
  cart.promoEmail = undefined;
  cart.promoDiscount = undefined;

  cart.discount = await computeGlobalPromotionDiscount({
    items: cart.items.map((i: any) => ({
      productId: String(i.productId),
      totalPrice: i.totalPrice,
    })),
    subtotal: cart.subtotal,
  });
  cart.total = cart.subtotal - (cart.discount || 0);

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
