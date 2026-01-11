import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimit = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  req: NextRequest,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
): boolean {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export function cleanupRateLimit() {
  const now = Date.now();
  for (const [ip, record] of rateLimit.entries()) {
    if (now > record.resetAt) {
      rateLimit.delete(ip);
    }
  }
}

setInterval(cleanupRateLimit, 60 * 60 * 1000);
