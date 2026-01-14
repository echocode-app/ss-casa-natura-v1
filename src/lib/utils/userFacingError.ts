const TECHY_PATTERNS: RegExp[] = [
  /\bvalidation failed\b/i,
  /\binvalid json\b/i,
  /\bcsrf\b/i,
  /\bunauthorized\b/i,
  /\bforbidden\b/i,
  /\bnot found\b/i,
  /\btypeerror\b/i,
  /\breferenceerror\b/i,
  /\bsyntaxerror\b/i,
  /\bmongoose\b/i,
  /\bmongo\b/i,
  /\bzod\b/i,
  /\bstack\b/i,
  /\bstripe signature\b/i,
  /\binvalid signature\b/i,
];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isSafeUserFacingMessage(message: unknown): message is string {
  if (!isNonEmptyString(message)) return false;

  const trimmed = message.trim();
  if (trimmed.length > 180) return false;
  if (trimmed.includes('\n') || trimmed.includes('\r')) return false;

  return !TECHY_PATTERNS.some((re) => re.test(trimmed));
}

export function getUserFacingErrorMessage(message: unknown, fallback: string): string {
  return isSafeUserFacingMessage(message) ? message.trim() : fallback;
}
