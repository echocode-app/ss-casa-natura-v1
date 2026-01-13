import { NextResponse, NextRequest } from 'next/server';
import { handleApi } from '@/lib/utils/handleApi';
import { verifyPassword, hashPassword } from '@/lib/auth/hash';
import User from '@/lib/db/models/User';
import connectToDB from '@/lib/db/mongo';
import { clearAuthCookie } from '@/lib/auth/cookies';
import { getUser } from '@/lib/auth/getUser';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import {
  createStrongPasswordSchema,
  validatePasswordAgainstUserInfo,
} from '@/lib/security/passwordValidation';
import { checkRateLimit } from '@/lib/security/rateLimit';

export const POST = handleApi(async (req: NextRequest) => {
  const t = await getTranslations('validation');

  // Rate limiting: 5 attempts per 15 minutes
  if (!checkRateLimit(req, 5)) {
    return NextResponse.json({ error: t('rateLimitExceeded') }, { status: 429 });
  }

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

  const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, t('currentPasswordRequired')),
    newPassword: createStrongPasswordSchema(),
  });

  const validation = changePasswordSchema.safeParse(body);
  if (!validation.success) {
    const firstError = validation.error.issues[0];
    const errorMessage = firstError?.message ? t(firstError.message as any) : t('invalidFormat');
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }

  const { currentPassword, newPassword } = validation.data;

  await connectToDB();

  const dbUser = await User.findById(userId);
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Validate password against user info
  const userInfoCheck = validatePasswordAgainstUserInfo(newPassword, {
    email: dbUser.email,
    name: dbUser.name,
    surname: dbUser.surname,
  });

  if (!userInfoCheck.valid && userInfoCheck.messageKey) {
    return NextResponse.json({ error: t(userInfoCheck.messageKey as any) }, { status: 400 });
  }

  const isValid = await verifyPassword(currentPassword, dbUser.passwordHash);
  if (!isValid) {
    return NextResponse.json({ error: t('currentPasswordIncorrect') }, { status: 400 });
  }

  // Check if new password is same as old password
  const isSameAsOld = await verifyPassword(newPassword, dbUser.passwordHash);
  if (isSameAsOld) {
    return NextResponse.json({ error: t('passwordSameAsOld') }, { status: 400 });
  }

  const newPasswordHash = await hashPassword(newPassword);
  dbUser.passwordHash = newPasswordHash;
  await dbUser.save();

  await clearAuthCookie();

  return NextResponse.json({ message: 'Password changed successfully' });
});
