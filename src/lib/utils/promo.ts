import PromoCode from '@/lib/db/models/PromoCode';

export type PromoValidationReason =
  | 'invalid'
  | 'used'
  | 'not_active'
  | 'expired'
  | 'usage_limit'
  | 'email_mismatch';

export type PromoComputationResult =
  | {
      ok: true;
      promoCode: string;
      promoDiscount: number;
    }
  | {
      ok: false;
      reason: PromoValidationReason;
    };

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function computePromoDiscount(params: {
  promoCode?: string;
  subtotal: number;
  email?: string;
  expectedEmail?: string;
  /**
   * When true, do not enforce promo.issuedToEmail matching.
   * Useful for guest flows where we cannot reliably verify ownership.
   */
  ignoreIssuedToEmail?: boolean;
}): Promise<PromoComputationResult> {
  const rawCode = params.promoCode;
  if (!rawCode) return { ok: false, reason: 'invalid' };

  const code = normalizeCode(rawCode);
  if (!code) return { ok: false, reason: 'invalid' };

  const email = params.email ? normalizeEmail(params.email) : undefined;
  const expectedEmail = params.expectedEmail ? normalizeEmail(params.expectedEmail) : undefined;

  if (expectedEmail && email && expectedEmail !== email) {
    return { ok: false, reason: 'email_mismatch' };
  }

  const promo = await PromoCode.findOne({ code }).lean();
  if (!promo) return { ok: false, reason: 'invalid' };

  // If this promo was issued for a specific email, require a matching email.
  if (promo.issuedToEmail && !params.ignoreIssuedToEmail) {
    if (!email) return { ok: false, reason: 'email_mismatch' };
    if (promo.issuedToEmail !== email) return { ok: false, reason: 'email_mismatch' };
  }

  if (email && Array.isArray(promo.usedByEmails) && promo.usedByEmails.includes(email)) {
    return { ok: false, reason: 'used' };
  }

  const now = new Date();
  if (promo.activeFrom && promo.activeFrom > now) return { ok: false, reason: 'not_active' };
  if (promo.activeUntil && promo.activeUntil < now) return { ok: false, reason: 'expired' };

  if (promo.usageLimit && (promo.usedCount || 0) >= promo.usageLimit) {
    return { ok: false, reason: 'usage_limit' };
  }

  const subtotal = Math.max(0, params.subtotal);
  let discount = 0;

  if (promo.type === 'percentage') {
    discount = Math.round(((subtotal * promo.value) / 100) * 100) / 100;
  } else if (promo.type === 'fixed') {
    discount = Math.min(promo.value, subtotal);
  }

  discount = Math.max(0, Math.min(discount, subtotal));

  return { ok: true, promoCode: promo.code, promoDiscount: discount };
}
