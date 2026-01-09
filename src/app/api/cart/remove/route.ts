import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { RemoveFromCartRequest, CartItemDB } from '@/types/cart';
import { z } from 'zod';

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
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = removeFromCartSchema.safeParse(body);
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

  const { itemId } = validation.data;

  const sessionId = await getCartSessionId();
  const userId = await getUserIdFromRequest(req);

  // Find cart
  const cart = await Cart.findOne({
    $or: [{ userId }, { sessionId }],
  });

  if (!cart) {
    return NextResponse.json({ success: false, error: 'Cart not found' }, { status: 404 });
  }

  // Remove item
  const initialLength = cart.items.length;
  cart.items = cart.items.filter(
    (item: CartItemDB) => item._id?.toString() !== itemId && item.id !== itemId,
  );

  if (cart.items.length === initialLength) {
    return NextResponse.json({ success: false, error: 'Item not found in cart' }, { status: 404 });
  }

  // Recalculate totals
  cart.subtotal = cart.items.reduce((sum: number, item: CartItemDB) => sum + item.totalPrice, 0);
  cart.total = cart.subtotal - (cart.discount || 0);

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
