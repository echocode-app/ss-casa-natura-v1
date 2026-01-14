export type CartPromoErrorCode =
  | 'INVALID_JSON'
  | 'VALIDATION_FAILED'
  | 'PROMO_EMAIL_REQUIRED'
  | 'CART_SESSION_UNAVAILABLE'
  | 'CART_NOT_FOUND'
  | 'CART_EMPTY'
  | 'PROMO_NOT_FOUND'
  | 'PROMO_EMAIL_MISMATCH'
  | 'PROMO_ALREADY_USED_BY_EMAIL'
  | 'PROMO_NOT_ACTIVE_YET'
  | 'PROMO_EXPIRED'
  | 'PROMO_USAGE_LIMIT_REACHED'
  | 'PROMO_APPLY_FAILED'
  | 'UNKNOWN';

export function normalizeCartPromoErrorCode(value: unknown): CartPromoErrorCode {
  if (typeof value !== 'string') return 'UNKNOWN';
  const trimmed = value.trim();
  if (!trimmed) return 'UNKNOWN';

  const upper = trimmed.toUpperCase();

  // If the error is coming from our context string (e.g. "promo: CODE")
  const withoutPrefix = upper.replace(/^PROMO:\s*/i, '');

  // If it looks like a backend errorCode, keep it.
  const known = new Set<CartPromoErrorCode>([
    'INVALID_JSON',
    'VALIDATION_FAILED',
    'PROMO_EMAIL_REQUIRED',
    'CART_SESSION_UNAVAILABLE',
    'CART_NOT_FOUND',
    'CART_EMPTY',
    'PROMO_NOT_FOUND',
    'PROMO_EMAIL_MISMATCH',
    'PROMO_ALREADY_USED_BY_EMAIL',
    'PROMO_NOT_ACTIVE_YET',
    'PROMO_EXPIRED',
    'PROMO_USAGE_LIMIT_REACHED',
    'PROMO_APPLY_FAILED',
    'UNKNOWN',
  ]);

  if (known.has(withoutPrefix as CartPromoErrorCode)) {
    return withoutPrefix as CartPromoErrorCode;
  }

  return 'UNKNOWN';
}

export function cartPromoErrorTranslationKey(code: CartPromoErrorCode): string {
  switch (code) {
    case 'PROMO_EMAIL_REQUIRED':
      return 'promoErrors.emailRequired';
    case 'PROMO_NOT_FOUND':
      return 'promoErrors.notFound';
    case 'PROMO_EMAIL_MISMATCH':
      return 'promoErrors.emailMismatch';
    case 'PROMO_ALREADY_USED_BY_EMAIL':
      return 'promoErrors.alreadyUsed';
    case 'PROMO_NOT_ACTIVE_YET':
      return 'promoErrors.notActiveYet';
    case 'PROMO_EXPIRED':
      return 'promoErrors.expired';
    case 'PROMO_USAGE_LIMIT_REACHED':
      return 'promoErrors.usageLimitReached';
    case 'CART_EMPTY':
      return 'promoErrors.cartEmpty';
    default:
      return 'discountError';
  }
}
