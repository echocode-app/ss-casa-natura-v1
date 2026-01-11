import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import Cart from '@/lib/db/models/Cart';
import { hashPassword } from '@/lib/auth/hash';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';
import { getCartSessionId } from '@/lib/utils/cartSession';
import { z } from 'zod';

export const runtime = 'nodejs';

const registerSchema = z.object({
  nome: z.string().min(1, 'Nome is required'),
  cognome: z.string().min(1, 'Cognome is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const POST = handleApi(async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = registerSchema.safeParse(body);
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const { nome, cognome, email, password } = validation.data;

  await connectToDB();

  const existing = await User.findOne({ email });
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await User.create({
    name: nome,
    surname: cognome,
    email,
    passwordHash,
  });

  const token = await signToken({ id: user._id.toString(), email: user.email, role: user.role });
  await setAuthCookie(token);

  // Merge guest cart into user cart
  const sessionId = await getCartSessionId();
  const guestCart = await Cart.findOne({ sessionId, userId: { $exists: false } });

  if (guestCart && guestCart.items.length > 0) {
    // Assign guest cart to user
    guestCart.userId = user._id.toString();
    await guestCart.save();
  }

  return NextResponse.json({
    user: {
      id: user._id,
      email: user.email,
    },
  });
});
