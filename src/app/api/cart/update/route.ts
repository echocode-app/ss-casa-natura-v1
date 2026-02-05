import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { UpdateCartItemRequest, CartItemDB } from '@/types/cart';
import { extendCartExpiration } from '@/lib/constants/cart';
import { z } from 'zod';
import { buildCartQuery } from '@/lib/utils/cartQuery';
import { checkItemsInStock } from '@/lib/utils/inventory';
import { recomputeCartTotals } from '@/lib/utils/cartMaintenance';

const updateCartItemSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  quantity: z.number().int().positive().min(1, 'Quantity must be at least 1'),
});

// POST /api/cart/update - Update item quantity in cart
export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

  // Parse and validate request body
  let body: UpdateCartItemRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errorCode: 'INVALID_JSON', error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const validation = updateCartItemSchema.safeParse(body);
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

  const { itemId, quantity } = validation.data;

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

  // Find and update item
  const itemIndex = cart.items.findIndex(
    (item: CartItemDB) => item._id?.toString() === itemId || item.id === itemId,
  );

  if (itemIndex === -1) {
    return NextResponse.json(
      { success: false, errorCode: 'ITEM_NOT_FOUND', error: 'Item not found in cart' },
      { status: 404 },
    );
  }

  const current = cart.items[itemIndex];
  const stockCheck = await checkItemsInStock([
    { productId: current.productId, variantId: current.variantId, quantity },
  ]);

  if (!stockCheck.ok) {
    const issue = stockCheck.issues[0];
    const outOfStock = issue.reason === 'NOT_AVAILABLE' || (issue.available ?? 0) <= 0;

    if (issue.reason === 'NOT_AVAILABLE') {
      cart.items = cart.items.filter(
        (item: CartItemDB) =>
          !(item.productId === current.productId && item.variantId === current.variantId),
      );
      await recomputeCartTotals(cart as any);
      cart.expiresAt = extendCartExpiration(!!cart.userId);
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
          removedItems: [
            {
              id: current._id?.toString() || current.id,
              productId: current.productId,
              variantId: current.variantId,
              title: current.title,
            },
          ],
          createdAt: cart.createdAt,
          updatedAt: cart.updatedAt,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        errorCode: outOfStock ? 'OUT_OF_STOCK' : 'INSUFFICIENT_STOCK',
        error: outOfStock ? 'Product is out of stock' : 'Insufficient stock',
        details: {
          productId: current.productId,
          variantId: current.variantId,
          requested: quantity,
          available: issue.available,
        },
      },
      { status: 409 },
    );
  }

  // Update quantity and total price
  cart.items[itemIndex].quantity = quantity;
  cart.items[itemIndex].totalPrice = cart.items[itemIndex].price * quantity;

  // Recalculate totals
  await recomputeCartTotals(cart as any);

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
