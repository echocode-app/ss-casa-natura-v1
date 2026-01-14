import { describe, expect, it } from 'vitest';

import { calculateShippingQuote } from '../shipping';

describe('calculateShippingQuote', () => {
  it('returns free shipping at or above threshold', () => {
    const quote = calculateShippingQuote({
      subtotal: 49,
      totalWeightKg: 10,
      address: { country: 'IT', postalCode: '20100' },
    });

    expect(quote).toEqual({
      currency: 'EUR',
      shippingPrice: 0,
      isFree: true,
      method: 'standard',
    });
  });

  it('calculates base + per-kg shipping below threshold', () => {
    const quote = calculateShippingQuote({
      subtotal: 10,
      totalWeightKg: 2,
      address: { country: 'IT', postalCode: '20100' },
    });

    // 5.99 + 1.2*2 = 8.39
    expect(quote.shippingPrice).toBe(8.39);
    expect(quote.isFree).toBe(false);
  });
});
