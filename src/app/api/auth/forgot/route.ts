import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import User from '@/lib/db/models/User';
import PasswordResetToken from '@/lib/db/models/PasswordResetToken';
import { sendEmail } from '@/lib/utils/sendEmail';
import { passwordResetEmailTemplate } from '@/lib/emailTemplates/passwordResetEmail';
import { getEmailTemplateOverrides } from '@/lib/emailTemplates/getEmailTemplateOverrides';
import crypto from 'crypto';
import { checkRateLimit } from '@/lib/security/rateLimit';

export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().email().max(320),
});

const RESET_EXPIRY_HOURS = 2;

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function getBaseUrl(req: NextRequest) {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  const origin = req.headers.get('origin');
  if (origin) return origin;
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  return host ? `${proto}://${host}` : '';
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

  const email = parsed.data.email.trim().toLowerCase();
  const user = await User.findOne({ email }).select('name surname email');

  if (!user) {
    return NextResponse.json({ success: true });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_HOURS * 60 * 60 * 1000);

  await PasswordResetToken.deleteMany({ userId: user._id, usedAt: { $exists: false } });
  await PasswordResetToken.create({
    userId: user._id,
    email: user.email,
    tokenHash,
    expiresAt,
  });

  const baseUrl = getBaseUrl(req);
  const resetUrl = `${baseUrl}/account?reset=${token}`;

  try {
    const overrides = await getEmailTemplateOverrides();
    await sendEmail({
      to: user.email,
      subject: 'Reset password Casa Natura / Reset your Casa Natura password',
      text: passwordResetEmailTemplate({
        name: user.name,
        resetUrl,
        expiresInHours: RESET_EXPIRY_HOURS,
        overrideText: overrides.passwordResetText,
      }),
    });
  } catch {
    // ignore email errors
  }

  return NextResponse.json({ success: true });
});
