import { NextRequest, NextResponse } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import { hashPassword } from '@/lib/auth/hash';
import { signToken } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';

export const POST = handleApi(async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { nome, cognome, email, password } = body;

  if (!nome || !cognome || !email || !password) {
    return NextResponse.json(
      { error: 'nome, cognome, email, and password are required' },
      { status: 400 },
    );
  }

  // basic validation
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  if (!email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

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

  // auto-login after registration
  const token = signToken({ id: user._id.toString(), email: user.email, role: user.role });
  await setAuthCookie(token);

  return NextResponse.json({
    user: {
      id: user._id,
      email: user.email,
    },
  });
});
