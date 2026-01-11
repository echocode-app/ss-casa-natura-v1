import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { CartItemDB } from '@/types/cart';

// GET /api/cart - Get current cart
export const GET = handleApi(async (req: NextRequest) => {
  await connectToDB();

  const sessionId = await getCartSessionId();
  const userId = await getUserIdFromRequest(req);

  // Try to find existing cart
  let cart = await Cart.findOne({
    $or: [{ userId }, { sessionId }],
  });

  if (!cart) {
    // Return empty cart without creating in DB to prevent empty cart documents
    return NextResponse.json({
      success: true,
      cart: {
        id: null,
        userId: userId || undefined,
        sessionId,
        items: [],
        subtotal: 0,
        discount: 0,
        promoCode: null,
        promoDiscount: 0,
        total: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  }

  const total = cart.subtotal - (cart.discount || 0) - (cart.promoDiscount || 0);

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
      total,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    },
  });
});
