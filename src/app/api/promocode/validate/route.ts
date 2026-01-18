import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { handleApi } from '@/lib/utils/handleApi';
import connectToDB from '@/lib/db/mongo';
import { getUserIdFromRequest } from '@/lib/auth/getUser';
import User from '@/lib/db/models/User';
import { computePromoDiscount } from '@/lib/utils/promo';

const schema = z.object({
  promoCode: z.string().min(1).max(50),
  subtotal: z.number().finite().min(0).max(1_000_000),
});

function toError(reason: string): { status: number; errorCode: string; error: string } {
  switch (reason) {
    case 'email_mismatch':
      return {
        status: 400,
        errorCode: 'PROMO_EMAIL_MISMATCH',
        error: "Questo codice e' valido solo per questa email",
      };
    case 'used':
      return {
        status: 400,
        errorCode: 'PROMO_ALREADY_USED_BY_EMAIL',
        error: 'Hai già utilizzato questo codice promozionale',
      };
    case 'not_active':
      return {
        status: 400,
        errorCode: 'PROMO_NOT_ACTIVE_YET',
        error: 'Questo codice non è ancora attivo',
      };
    case 'expired':
      return { status: 400, errorCode: 'PROMO_EXPIRED', error: 'Questo codice è scaduto' };
    case 'usage_limit':
      return {
        status: 400,
        errorCode: 'PROMO_USAGE_LIMIT_REACHED',
        error: 'Questo codice ha raggiunto il limite di utilizzi',
      };
    case 'invalid':
    default:
      return { status: 404, errorCode: 'PROMO_NOT_FOUND', error: 'Codice promozionale non valido' };
  }
}

/**
 * POST /api/promocode/validate
 * Validates and computes discount for a promo code without requiring a server-side cart.
 * - Authenticated users: strict email binding (account email)
 * - Guests: allow promo even if issued for another email (cannot verify), but still validates time/usageLimit.
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

  const promoCode = parsed.data.promoCode;
  const subtotal = parsed.data.subtotal;

  const userId = await getUserIdFromRequest(req);

  let email: string | undefined;
  if (userId) {
    const user = await User.findById(userId).select('email').lean();
    email = user?.email ? String(user.email).trim().toLowerCase() : undefined;
  }

  const result = await computePromoDiscount({
    promoCode,
    subtotal,
    email,
    ignoreIssuedToEmail: !userId,
  });

  if (!result.ok) {
    const mapped = toError(result.reason);
    return NextResponse.json(
      { success: false, errorCode: mapped.errorCode, error: mapped.error },
      { status: mapped.status },
    );
  }

  return NextResponse.json({
    success: true,
    promoCode: result.promoCode,
    promoDiscount: result.promoDiscount,
  });
});
