import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getProduct: vi.fn(),
  getProductForCart: vi.fn(),
}));

vi.mock('@/lib/services/product', () => ({
  productService: {
    getProduct: mocks.getProduct,
    getProductForCart: mocks.getProductForCart,
  },
}));

import { priceItems } from '../pricing';

describe('priceItems', () => {
  it('reprices items server-side and calculates totals', async () => {
    mocks.getProduct.mockResolvedValue({ weight: 500 }); // heuristic: grams -> 0.5kg
    mocks.getProductForCart.mockResolvedValue({
      price: 10,
      slug: 'olio-test',
      title: 'Olio Test',
      variant: { volume: 250, unit: 'ml' },
    });

    const result = await priceItems([{ productId: 'p1', variantId: 'v1', quantity: 2 }]);

    expect(result.subtotal).toBe(20);
    expect(result.totalWeightKg).toBe(1);
    expect(result.pricedItems).toHaveLength(1);
    expect(result.pricedItems[0]).toMatchObject({
      productId: 'p1',
      variantId: 'v1',
      slug: 'olio-test',
      title: 'Olio Test',
      price: 10,
      quantity: 2,
      volume: 250,
      unit: 'ml',
      lineTotal: 20,
      weightKg: 1,
    });
  });

  it('clamps quantity to at least 1', async () => {
    mocks.getProduct.mockResolvedValue({ weightGrams: 300 }); // 0.3kg
    mocks.getProductForCart.mockResolvedValue({
      price: 7.5,
      slug: 'test',
      title: 'Test',
      variant: {},
    });

    const result = await priceItems([{ productId: 'p1', variantId: 'v1', quantity: 0 }]);

    expect(result.subtotal).toBe(7.5);
    expect(result.totalWeightKg).toBe(0.3);
    expect(result.pricedItems[0].quantity).toBe(1);
  });
});
