import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';

const handler = handleApi(async (req: NextRequest) => {
  await connectToDB();

  const { email, password } = await req.json();
  const user = await User.findOne({ email });
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET!, {
    expiresIn: '7d',
  });

  log('success', `User logged in: ${user.email}`);
  const res = NextResponse.json({ message: 'Logged in' });
  res.cookies.set('token', token, { httpOnly: true, path: '/' });
  return res;
});

export const POST = handler;
