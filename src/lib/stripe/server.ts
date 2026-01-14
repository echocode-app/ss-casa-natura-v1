import Stripe from 'stripe';

let stripeSingleton: Stripe | null = null;

export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    const err = new Error('Stripe is not configured');
    (err as any).code = 'STRIPE_NOT_CONFIGURED';
    throw err;
  }

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(secretKey, {
      apiVersion: '2025-12-15.clover',
    });
  }

  return stripeSingleton;
}

// Backward-compatible named export for existing imports.
// Initializes lazily and throws only when actually used.
export const stripe: Stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripe() as any;
    return client[prop];
  },
});
