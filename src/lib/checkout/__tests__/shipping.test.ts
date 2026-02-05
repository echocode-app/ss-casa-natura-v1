import { describe, expect, it } from 'vitest';

import { calculateShippingQuote } from '../shipping';

describe('calculateShippingQuote', () => {
  it('returns free shipping when settings are zero', () => {
    const quote = calculateShippingQuote(
      {
        subtotal: 49,
        totalWeightKg: 10,
        address: { country: 'IT', postalCode: '20100' },
      },
      { pricePerGram: 0, fixedFee: 0 },
    );

    expect(quote).toEqual({
      currency: 'EUR',
      shippingPrice: 0,
      recurringPrice: 0,
      isFree: true,
      method: 'standard',
    });
  });

  it('calculates per-gram + fixed fee', () => {
    const quote = calculateShippingQuote(
      {
        subtotal: 10,
        totalWeightKg: 2,
        address: { country: 'IT', postalCode: '20100' },
      },
      { pricePerGram: 0.0012, fixedFee: 5.99 },
    );

    // 2kg = 2000g -> 5.99 + 0.0012*2000 = 8.39
    expect(quote.shippingPrice).toBe(8.39);
    expect(quote.isFree).toBe(false);
  });

  it('falls back to per-kg setting when per-gram is missing', () => {
    const quote = calculateShippingQuote(
      {
        subtotal: 10,
        totalWeightKg: 2,
        address: { country: 'IT', postalCode: '20100' },
      },
      { pricePerKg: 1.2, fixedFee: 0 },
    );

    // 2kg * 1.2 = 2.4
    expect(quote.shippingPrice).toBe(2.4);
  });

  it('defaults to zero settings when none provided', () => {
    const quote = calculateShippingQuote({
      subtotal: 49,
      totalWeightKg: 10,
      address: { country: 'IT', postalCode: '20100' },
    });
    expect(quote.shippingPrice).toBe(0);
    expect(quote.isFree).toBe(true);
  });
});
