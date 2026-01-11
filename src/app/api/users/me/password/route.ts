import { NextResponse, NextRequest } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { verifyPassword, hashPassword } from '@/lib/auth/hash';
import User from '@/lib/db/models/User';
import connectToDB from '@/lib/db/mongo';
import { clearAuthCookie } from '@/lib/auth/cookies';
import { getUser } from '@/lib/auth/getUser';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export const POST = handleApi(async (req: NextRequest) => {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = user.id;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const validation = changePasswordSchema.safeParse(body);
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
  }

  const { currentPassword, newPassword } = validation.data;

  await connectToDB();

  const dbUser = await User.findById(userId);
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  }

  const newPasswordHash = await hashPassword(newPassword);
  dbUser.passwordHash = newPasswordHash;
  await dbUser.save();

  await clearAuthCookie();

  return NextResponse.json({ message: 'Password changed successfully' });
});
