/**
 * Cart TTL (Time To Live) Configuration
 *
 * Defines how long carts remain active before automatic cleanup
 */

/**
 * Guest cart TTL: 7 days
 * Guest carts expire faster as they're not tied to user accounts
 */
export const GUEST_CART_TTL_DAYS = 7;
export const GUEST_CART_TTL_MS = GUEST_CART_TTL_DAYS * 24 * 60 * 60 * 1000;

/**
 * Authenticated user cart TTL: 30 days
 * User carts persist longer for better UX
 */
export const USER_CART_TTL_DAYS = 30;
export const USER_CART_TTL_MS = USER_CART_TTL_DAYS * 24 * 60 * 60 * 1000;

/**
 * Calculate expiration date for a cart
 * @param isAuthenticated - Whether the cart belongs to an authenticated user
 * @returns Date when the cart should expire
 */
export function getCartExpirationDate(isAuthenticated: boolean): Date {
  const ttlMs = isAuthenticated ? USER_CART_TTL_MS : GUEST_CART_TTL_MS;
  return new Date(Date.now() + ttlMs);
}

/**
 * Extend cart expiration on activity
 * Called when user interacts with their cart
 * @param isAuthenticated - Whether the cart belongs to an authenticated user
 * @returns New expiration date
 */
export function extendCartExpiration(isAuthenticated: boolean): Date {
  return getCartExpirationDate(isAuthenticated);
}
