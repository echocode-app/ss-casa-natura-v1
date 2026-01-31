import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import PasswordResetToken from '@/lib/db/models/PasswordResetToken';
import User from '@/lib/db/models/User';
import { createPasswordSchema } from '@/lib/security/passwordValidation';
import { hashPassword } from '@/lib/auth/hash';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/security/rateLimit';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(10),
  newPassword: createPasswordSchema(),
});

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const POST = handleApi(async (req: NextRequest) => {
  if (!checkRateLimit(req, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { success: false, errorCode: 'RATE_LIMIT', error: 'Rate limit exceeded' },
      { status: 429 },
    );
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, errorCode: 'INVALID_JSON', error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, errorCode: 'VALIDATION_FAILED', error: 'Validation failed' },
      { status: 400 },
    );
  }

  await connectToDB();

  const tokenHash = hashToken(parsed.data.token);
  const resetDoc = await PasswordResetToken.findOne({
    tokenHash,
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  }).lean();

  if (!resetDoc) {
    return NextResponse.json(
      { success: false, errorCode: 'TOKEN_INVALID', error: 'Token invalid or expired' },
      { status: 400 },
    );
  }

  const user = await User.findById(resetDoc.userId);
  if (!user) {
    return NextResponse.json(
      { success: false, errorCode: 'USER_NOT_FOUND', error: 'User not found' },
      { status: 404 },
    );
  }

  user.passwordHash = await hashPassword(parsed.data.newPassword);
  await user.save();

  await PasswordResetToken.updateOne({ _id: resetDoc._id }, { $set: { usedAt: new Date() } });

  return NextResponse.json({ success: true });
});
