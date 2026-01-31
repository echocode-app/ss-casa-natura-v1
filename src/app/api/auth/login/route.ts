import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import Cart from '@/lib/db/models/Cart';
import { verifyPassword } from '@/lib/auth/hash';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { checkRateLimit } from '@/lib/utils/rateLimit';
import { productService } from '@/lib/services/product';
import { checkItemsInStock } from '@/lib/utils/inventory';
import { computeGlobalPromotionDiscount } from '@/lib/utils/globalPromotion';
import { computePromoDiscount } from '@/lib/utils/promo';
import { extendCartExpiration, getCartExpirationDate } from '@/lib/constants/cart';
import { z } from 'zod';

export const runtime = 'nodejs';

const guestItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().int().positive().max(99),
});

const loginSchema = z.object({
  email: z.string().email('invalidEmail').max(320, 'fieldTooLong'),
  password: z.string().min(1, 'passwordRequired'),
  guestCart: z
    .object({
      items: z.array(guestItemSchema).max(200),
    })
    .optional(),
});

export const POST = handleApi(async (req: NextRequest) => {
  if (!checkRateLimit(req, 5)) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'RATE_LIMIT',
        error: 'Too many login attempts. Please try again later.',
      },
      { status: 429 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errorCode: 'INVALID_JSON', error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        success: false,
        errorCode: 'VALIDATION_FAILED',
        error: 'Validation failed',
        details: errors,
      },
      { status: 400 },
    );
  }

  const { email, password, guestCart: guestPayload } = validation.data;

  await connectToDB();

  const user = await User.findOne({ email });
  const hashedPassword = user?.passwordHash || '$2a$10$invalidhashtopreventtimingattack';

  const isValid = await verifyPassword(password, hashedPassword);

  if (!user || !isValid) {
    return NextResponse.json(
      { success: false, errorCode: 'INVALID_CREDENTIALS', error: 'Invalid credentials' },
      { status: 401 },
    );
  }

  // Backward-compatibility: some DB entries may have legacy role value `develop`.
  // Normalize it to `developer` (the canonical role) and persist.
  let normalizedRole = user.role;
  if (normalizedRole === 'develop') {
    normalizedRole = 'developer';
    user.role = 'developer';
    (user as any).updatedAt = new Date();
    await user.save();
  }

  const token = await signToken({
    id: user._id.toString(),
    email: user.email,
    role: normalizedRole,
  });
  await setAuthCookie(token);

  // Merge guest cart into user cart (server cart + client payload)
  const sessionId = await getCartSessionId();
  const dbGuestCart = await Cart.findOne({ sessionId, userId: { $exists: false } });
  let userCart = await Cart.findOne({ userId: user._id.toString() });

  const payloadItems = Array.isArray(guestPayload?.items) ? guestPayload.items : [];
  const hasDbGuestItems = Boolean(dbGuestCart?.items?.length);
  const hasPayloadItems = payloadItems.length > 0;

  if (hasDbGuestItems || hasPayloadItems) {
    if (!userCart) {
      userCart = await Cart.create({
        userId: user._id.toString(),
        sessionId,
        items: [],
        subtotal: 0,
        total: 0,
        expiresAt: getCartExpirationDate(true),
      });
    }

    if (dbGuestCart?.items?.length) {
      dbGuestCart.items.forEach((guestItem: any) => {
        const existingIndex = userCart!.items.findIndex(
          (userItem: any) =>
            userItem.productId === guestItem.productId &&
            userItem.variantId === guestItem.variantId,
        );
        if (existingIndex >= 0) {
          userCart!.items[existingIndex].quantity += guestItem.quantity;
          userCart!.items[existingIndex].totalPrice =
            userCart!.items[existingIndex].price * userCart!.items[existingIndex].quantity;
        } else {
          userCart!.items.push(guestItem);
        }
      });
    }

    if (payloadItems.length) {
      const desiredChecks = payloadItems.map((item) => {
        const existing = userCart!.items.find(
          (i: any) => i.productId === item.productId && i.variantId === item.variantId,
        );
        const desiredQty = (existing?.quantity || 0) + item.quantity;
        return { productId: item.productId, variantId: item.variantId, quantity: desiredQty };
      });

      const stockCheck = await checkItemsInStock(desiredChecks);
      const blocked = new Set(
        stockCheck.ok ? [] : stockCheck.issues.map((i) => `${i.productId}-${i.variantId}`),
      );

      for (const item of payloadItems) {
        const key = `${item.productId}-${item.variantId}`;
        if (blocked.has(key)) continue;

        const existingIndex = userCart!.items.findIndex(
          (i: any) => i.productId === item.productId && i.variantId === item.variantId,
        );
        if (existingIndex >= 0) {
          userCart!.items[existingIndex].quantity += item.quantity;
          userCart!.items[existingIndex].totalPrice =
            userCart!.items[existingIndex].price * userCart!.items[existingIndex].quantity;
          continue;
        }

        try {
          const productData = await productService.getProductForCart(
            item.productId,
            item.variantId,
          );
          userCart!.items.push({
            productId: item.productId,
            variantId: item.variantId,
            slug: productData.slug,
            title: productData.title,
            imageSrc: productData.imageSrc,
            price: productData.price,
            volume: productData.variant.volume,
            unit: productData.variant.unit,
            quantity: item.quantity,
            totalPrice: productData.price * item.quantity,
          });
        } catch {
          // ignore invalid items
        }
      }
    }

    userCart!.subtotal = userCart!.items.reduce(
      (sum: number, item: any) => sum + item.totalPrice,
      0,
    );

    userCart!.discount = await computeGlobalPromotionDiscount({
      items: userCart!.items.map((i: any) => ({
        productId: String(i.productId),
        totalPrice: i.totalPrice,
      })),
      subtotal: userCart!.subtotal,
    });

    if (userCart!.promoCode) {
      const promoResult = await computePromoDiscount({
        promoCode: userCart!.promoCode,
        subtotal: userCart!.subtotal,
        email: userCart!.promoEmail,
      });

      if (promoResult.ok) {
        userCart!.promoCode = promoResult.promoCode;
        userCart!.promoDiscount = promoResult.promoDiscount;
      } else {
        userCart!.promoCode = undefined;
        userCart!.promoEmail = undefined;
        userCart!.promoDiscount = 0;
      }
    }

    userCart!.total =
      userCart!.subtotal - (userCart!.discount || 0) - (userCart!.promoDiscount || 0);

    userCart!.expiresAt = extendCartExpiration(true);

    await userCart!.save();

    if (dbGuestCart) {
      await Cart.deleteOne({ _id: dbGuestCart._id });
    }
  }

  return NextResponse.json({
    user: {
      id: user._id,
      email: user.email,
    },
  });
});
