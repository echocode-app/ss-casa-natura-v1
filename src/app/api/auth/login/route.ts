import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import Cart from '@/lib/db/models/Cart';
import { verifyPassword } from '@/lib/auth/hash';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { z } from 'zod';

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const POST = handleApi(async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = loginSchema.safeParse(body);
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const { email, password } = validation.data;

  await connectToDB();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = await signToken({ id: user._id.toString(), email: user.email, role: user.role });
  await setAuthCookie(token);

  // Merge guest cart into user cart
  const sessionId = await getCartSessionId();
  const guestCart = await Cart.findOne({ sessionId, userId: { $exists: false } });
  const userCart = await Cart.findOne({ userId: user._id.toString() });

  if (guestCart && guestCart.items.length > 0) {
    if (userCart) {
      // Merge items into user cart
      guestCart.items.forEach((guestItem: any) => {
        const existingIndex = userCart.items.findIndex(
          (userItem: any) =>
            userItem.productId === guestItem.productId &&
            userItem.variantId === guestItem.variantId,
        );
        if (existingIndex >= 0) {
          userCart.items[existingIndex].quantity += guestItem.quantity;
          userCart.items[existingIndex].totalPrice =
            userCart.items[existingIndex].price * userCart.items[existingIndex].quantity;
        } else {
          userCart.items.push(guestItem);
        }
      });
      // Recalculate totals
      userCart.subtotal = userCart.items.reduce(
        (sum: number, item: any) => sum + item.totalPrice,
        0,
      );
      userCart.total = userCart.subtotal - (userCart.discount || 0) - (userCart.promoDiscount || 0);
      await userCart.save();
      // Delete guest cart
      await Cart.deleteOne({ _id: guestCart._id });
    } else {
      // Assign guest cart to user
      guestCart.userId = user._id.toString();
      await guestCart.save();
    }
  }

  return NextResponse.json({
    user: {
      id: user._id,
      email: user.email,
    },
  });
});
