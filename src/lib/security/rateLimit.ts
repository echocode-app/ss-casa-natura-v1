import { NextRequest } from 'next/server';

interface RateLimitRecord {
  count: number;
  resetAt: number;
  blocked: boolean;
  blockUntil?: number;
}

// Persistent rate limit store (in production, use Redis)
const rateLimit = new Map<string, RateLimitRecord>();

const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes block after max attempts

/**
 * Enhanced rate limiter with progressive blocking
 * @param req - NextRequest object
 * @param maxAttempts - Maximum attempts allowed in window
 * @param windowMs - Time window in milliseconds
 * @param identifier - Custom identifier (defaults to IP)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  req: NextRequest,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
  identifier?: string,
): boolean {
  const key =
    identifier ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const now = Date.now();
  const record = rateLimit.get(key);

  // Check if currently blocked
  if (record?.blocked && record.blockUntil && now < record.blockUntil) {
    return false;
  }

  // Reset if window expired or was blocked
  if (!record || now > record.resetAt || (record.blocked && now >= record.blockUntil!)) {
    rateLimit.set(key, {
      count: 1,
      resetAt: now + windowMs,
      blocked: false,
    });
    return true;
  }

  // Increment counter
  record.count++;

  // Block if max attempts exceeded
  if (record.count > maxAttempts) {
    record.blocked = true;
    record.blockUntil = now + BLOCK_DURATION;
    return false;
  }

  return true;
}

/**
 * Get remaining attempts for an identifier
 */
export function getRemainingAttempts(
  req: NextRequest,
  maxAttempts: number,
  identifier?: string,
): number {
  const key =
    identifier ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const record = rateLimit.get(key);
  if (!record) return maxAttempts;

  const remaining = maxAttempts - record.count;
  return Math.max(0, remaining);
}

/**
 * Reset rate limit for specific identifier (e.g., after successful login)
 */
export function resetRateLimit(identifier: string): void {
  rateLimit.delete(identifier);
}

/**
 * Cleanup expired rate limit records
 */
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, record] of rateLimit.entries()) {
    if (now > record.resetAt && (!record.blocked || now >= record.blockUntil!)) {
      rateLimit.delete(key);
    }
  }
}

// Cleanup every hour
setInterval(cleanupRateLimit, 60 * 60 * 1000);

// Export for testing/monitoring
export function getRateLimitStats() {
  return {
    totalEntries: rateLimit.size,
    blocked: Array.from(rateLimit.entries())
      .filter(([, record]) => record.blocked)
      .map(([key]) => key),
  };
}
