/**
 * Client-side CSRF token utilities
 *
 * These functions help retrieve and attach CSRF tokens to requests
 * for protection against Cross-Site Request Forgery attacks.
 */

/**
 * Get CSRF token from browser cookies
 * @returns CSRF token string or null if not found
 */
export function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(/csrf-token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Get headers object with CSRF token included
 * Useful for fetch requests that need CSRF protection
 *
 * @param additionalHeaders - Any additional headers to include
 * @returns Headers object with CSRF token
 */
export function getCsrfHeaders(additionalHeaders: HeadersInit = {}): HeadersInit {
  const csrfToken = getCsrfToken();

  return {
    ...additionalHeaders,
    ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
  };
}
