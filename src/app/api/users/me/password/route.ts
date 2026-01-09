import { NextResponse, NextRequest } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { getUser } from '@/lib/auth/getUser';
import { verifyPassword, hashPassword } from '@/lib/auth/hash';
import User from '@/lib/db/models/User';
import connectToDB from '@/lib/db/mongo';
import { clearAuthCookie } from '@/lib/auth/cookies';

export const POST = handleApi(async (req: NextRequest) => {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
  }

  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'currentPassword and newPassword are required' },
      { status: 400 },
    );
  }

  // check password strength
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters' },
      { status: 400 },
    );
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await connectToDB();

  const dbUser = await User.findById(user.id);
  if (!dbUser) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }
  const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);

  if (!isValid) {
    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
  }

  dbUser.passwordHash = await hashPassword(newPassword);
  await dbUser.save();

  // invalidate session via helper
  await clearAuthCookie();

  return NextResponse.json({ message: 'Password changed successfully. Please log in again.' });
});
