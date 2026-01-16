import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import Cart from '@/lib/db/models/Cart';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import { AddToCartRequest, CartItemDB } from '@/types/cart';
import { productService } from '@/lib/services/product';
import { getCartExpirationDate, extendCartExpiration } from '@/lib/constants/cart';
import { z } from 'zod';
import { buildCartQuery } from '@/lib/utils/cartQuery';
import { computePromoDiscount } from '@/lib/utils/promo';
import { checkItemsInStock } from '@/lib/utils/inventory';
import { computeGlobalPromotionDiscount } from '@/lib/utils/globalPromotion';

const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().min(1, 'Variant ID is required'),
  quantity: z.number().int().positive().default(1),
});

// POST /api/cart/add - Add item to cart
export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

  // Parse and validate request body
  let body: AddToCartRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errorCode: 'INVALID_JSON', error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const validation = addToCartSchema.safeParse(body);
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

  const { productId, variantId, quantity } = validation.data;

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

  // Find or create cart only if adding item
  let cart = await Cart.findOne({
    ...cartQuery,
  });

  if (!cart) {
    // Only create cart if adding at least 1 item
    if (!productId || !variantId || !quantity || quantity < 1) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'CANNOT_CREATE_EMPTY_CART',
          error: 'Cannot create empty cart',
        },
        { status: 409 },
      );
    }
    const isAuthenticated = !!userId;
    cart = await Cart.create({
      userId: userId || undefined,
      sessionId,
      items: [],
      subtotal: 0,
      total: 0,
      expiresAt: getCartExpirationDate(isAuthenticated),
    });
  } else {
    // Extend expiration on cart activity
    const isAuthenticated = !!cart.userId;
    cart.expiresAt = extendCartExpiration(isAuthenticated);
  }

  // Check if item already exists
  const existingItemIndex = cart.items.findIndex(
    (item: CartItemDB) => item.productId === productId && item.variantId === variantId,
  );

  const desiredQuantity =
    existingItemIndex >= 0 ? (cart.items[existingItemIndex].quantity || 0) + quantity : quantity;

  const stockCheck = await checkItemsInStock([{ productId, variantId, quantity: desiredQuantity }]);

  if (!stockCheck.ok) {
    const issue = stockCheck.issues[0];
    const outOfStock = issue.reason === 'NOT_AVAILABLE' || (issue.available ?? 0) <= 0;

    return NextResponse.json(
      {
        success: false,
        errorCode: outOfStock ? 'OUT_OF_STOCK' : 'INSUFFICIENT_STOCK',
        error: outOfStock ? 'Product is out of stock' : 'Insufficient stock',
        details: {
          productId,
          variantId,
          requested: desiredQuantity,
          available: issue.available,
        },
      },
      { status: 409 },
    );
  }

  if (existingItemIndex >= 0) {
    // Update quantity of existing item
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].totalPrice =
      cart.items[existingItemIndex].price * cart.items[existingItemIndex].quantity;
  } else {
    // Get product details
    const productData = await productService.getProductForCart(productId, variantId, quantity);

    cart.items.push({
      productId,
      variantId,
      slug: productData.slug,
      title: productData.title,
      imageSrc: productData.imageSrc,
      price: productData.price,
      volume: productData.variant.volume,
      unit: productData.variant.unit,
      quantity,
      totalPrice: productData.price * quantity,
    });
  }

  // Recalculate totals
  cart.subtotal = cart.items.reduce((sum: number, item: CartItemDB) => sum + item.totalPrice, 0);

  cart.discount = await computeGlobalPromotionDiscount({
    items: cart.items.map((i: any) => ({
      productId: String(i.productId),
      totalPrice: i.totalPrice,
    })),
    subtotal: cart.subtotal,
  });

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
