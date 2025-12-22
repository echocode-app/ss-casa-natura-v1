import { NextRequest, NextResponse } from 'next/server';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { log } from '@/lib/utils/logger';
import { handleApi } from '@/lib/utils/handleApi';

const handler = handleApi(async (req: NextRequest) => {
  await connectToDB();

  const token = req.cookies.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
  const user = await User.findById(payload.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const { currentPassword, newPassword } = await req.json();

  // Check current password
  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) return NextResponse.json({ error: 'Current password incorrect' }, { status: 400 });

  // Update password
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  log('success', `Password changed: ${user.email}`);
  return NextResponse.json({ message: 'Password updated successfully' });
});

export const PUT = handler;
