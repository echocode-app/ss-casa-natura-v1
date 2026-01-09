import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { verifyPassword } from '@/lib/auth/hash';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';

export const POST = handleApi(async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  await connectToDB();

  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });

  await setAuthCookie(token);

  return NextResponse.json({ user: { id: user._id, email: user.email } });
});
