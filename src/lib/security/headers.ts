/**
 * Security Headers Configuration for Next.js
 * Implements OWASP recommended security headers
 */

export const securityHeaders = [
  // Prevent clickjacking attacks
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // Enable browser XSS protection
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // Control referrer information
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Restrict browser features and APIs
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Content Security Policy - Strict but allows necessary resources
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://cdn.iubenda.com https://cs.iubenda.com",
      "script-src-elem 'self' 'unsafe-inline' https://js.stripe.com https://cdn.iubenda.com https://cs.iubenda.com",
      "style-src 'self' 'unsafe-inline' https://cdn.iubenda.com",
      "style-src-elem 'self' 'unsafe-inline' https://cdn.iubenda.com",
      "img-src 'self' data: https: blob: https://cdn.iubenda.com",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com https://*.mailchimp.com https://idb.iubenda.com https://cpl.iubenda.com https://api.mapbox.com",
      "frame-src 'self' https://js.stripe.com https://www.iubenda.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  // HSTS - Force HTTPS for 1 year (only in production)
  ...(process.env.NODE_ENV === 'production'
    ? [
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000; includeSubDomains; preload',
        },
      ]
    : []),
];
