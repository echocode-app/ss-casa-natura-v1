import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { CartItemDB } from '@/types/cart';
import { getCartExpirationDate } from '@/lib/constants/cart';
import { buildCartQuery } from '@/lib/utils/cartQuery';

// POST /api/cart/clear - Clear all items from cart
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

  // Find and update cart
  const cart = await Cart.findOneAndUpdate(
    cartQuery,
    {
      $set: {
        items: [],
        subtotal: 0,
        total: 0,
        discount: 0,
        promoCode: undefined,
        promoEmail: undefined,
        promoDiscount: undefined,
      },
    },
    { new: true },
  );

  if (!cart) {
    // Create empty cart if doesn't exist
    const isAuthenticated = !!userId;
    const newCart = await Cart.create({
      userId: userId || undefined,
      sessionId,
      items: [],
      subtotal: 0,
      total: 0,
      expiresAt: getCartExpirationDate(isAuthenticated),
    });

    return NextResponse.json({
      success: true,
      cart: {
        id: newCart._id.toString(),
        userId: newCart.userId,
        sessionId: newCart.sessionId,
        items: [],
        subtotal: 0,
        discount: 0,
        promoCode: undefined,
        promoDiscount: undefined,
        total: 0,
        createdAt: newCart.createdAt,
        updatedAt: newCart.updatedAt,
      },
    });
  }

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
