import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/utils/logger';
import { sendEmail } from '@/lib/utils/sendEmail';
import { handleApi } from '@/lib/utils/handleApi';

const handler = handleApi(async (req: NextRequest) => {
  await connectToDB();
  log('server', 'Connected to DB');

  const { name, email, password } = await req.json();

  const existing = await User.findOne({ email });
  if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, verified: false });

  // Generate email verification token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });

  await sendEmail({
    to: email,
    subject: 'Verify your account',
    text: `Please verify your account: ${process.env.NEXT_PUBLIC_FRONTEND_URL}/verify?token=${token}`,
  });

  log('success', `User registered: ${user.email}`);
  return NextResponse.json({ message: 'User created. Verification email sent.' });
});

export const POST = handler;
