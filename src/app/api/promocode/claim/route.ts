import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import MarketingEmail from '@/lib/db/models/MarketingEmail';
import PromoCode from '@/lib/db/models/PromoCode';
import { subscribeToMailchimp } from '@/lib/mailchimp/subscribe';
import { sendEmail } from '@/lib/utils/sendEmail';
import { promoCodeEmailTemplate } from '@/lib/emailTemplates/promoCodeEmail';
import { getEmailTemplateOverrides } from '@/lib/emailTemplates/getEmailTemplateOverrides';

const schema = z.object({
  email: z.string().email().max(320),
});

function generatePromoCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 8; i++) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `WELCOME-${suffix}`;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

function addMonths(d: Date, months: number): Date {
  const copy = new Date(d.getTime());
  copy.setMonth(copy.getMonth() + months);
  return copy;
}

/**
 * POST /api/promocode/claim
 * Exchanges a (new) marketing subscription for a single-use promo code.
 * - One code per email (issuedToEmail is unique+sparse)
 * - Code is consumed after successful payment (webhook)
 */
export const POST = handleApi(async (req: NextRequest) => {
  await connectToDB();

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
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        success: false,
        errorCode: 'VALIDATION_FAILED',
        error: first?.message || 'Validation failed',
      },
      { status: 400 },
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const overrides = await getEmailTemplateOverrides();

  // If a promo already exists for this email, return it (idempotent UX).
  const existingPromo = await PromoCode.findOne({ issuedToEmail: email }).lean();
  if (existingPromo?.code) {
    try {
      await sendEmail({
        to: email,
        subject: 'Il tuo codice promozionale / Your promo code',
        text: promoCodeEmailTemplate({
          name: '',
          code: existingPromo.code,
          overrideText: overrides.promoCodeText,
        }),
      });
    } catch {
      // ignore email errors
    }
    return NextResponse.json({ success: true, promoCode: existingPromo.code });
  }

  // Require a *new* marketing subscription.
  const existingMarketing = await MarketingEmail.findOne({ email }).lean();
  if (existingMarketing) {
    return NextResponse.json(
      {
        success: false,
        errorCode: 'EMAIL_ALREADY_SUBSCRIBED',
        error: 'Email already subscribed',
      },
      { status: 409 },
    );
  }

  // Subscribe first; if it fails we don't issue a code.
  try {
    await subscribeToMailchimp(email, 'promocode');
  } catch (e: any) {
    const msg = String(e?.message || 'Subscription failed');
    // If Mailchimp says the member exists, treat it as already subscribed.
    if (/member\s+exists|already\s+subscribed/i.test(msg)) {
      return NextResponse.json(
        {
          success: false,
          errorCode: 'EMAIL_ALREADY_SUBSCRIBED',
          error: 'Email already subscribed',
        },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, errorCode: 'SUBSCRIPTION_FAILED', error: 'Subscription failed' },
      { status: 502 },
    );
  }

  await MarketingEmail.create({ email, source: 'promocode' });

  const now = new Date();

  // Create a single-use promo code for this email.
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generatePromoCode();
    try {
      const created = await PromoCode.create({
        code,
        issuedToEmail: email,
        type: 'percentage',
        value: 10,
        activeFrom: now,
        activeUntil: addMonths(now, 3),
        usageLimit: 1,
      });

      try {
        await sendEmail({
          to: email,
          subject: 'Il tuo codice promozionale / Your promo code',
          text: promoCodeEmailTemplate({
            name: '',
            code: created.code,
            overrideText: overrides.promoCodeText,
          }),
        });
      } catch {
        // ignore email errors
      }

      return NextResponse.json({ success: true, promoCode: created.code });
    } catch (err: any) {
      // Duplicate code or duplicate issuedToEmail (race): retry/fetch.
      if (err?.code === 11000) {
        const again = await PromoCode.findOne({ issuedToEmail: email }).lean();
        if (again?.code) {
          return NextResponse.json({ success: true, promoCode: again.code });
        }
        continue;
      }
      throw err;
    }
  }

  return NextResponse.json(
    {
      success: false,
      errorCode: 'PROMO_GENERATION_FAILED',
      error: 'Failed to generate promo code',
    },
    { status: 500 },
  );
});
