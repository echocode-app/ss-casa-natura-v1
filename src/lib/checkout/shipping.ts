import { ShippingAddress } from '@/types/checkout';

export type ShippingQuoteInput = {
  subtotal: number;
  totalWeightKg: number;
  address: Pick<ShippingAddress, 'country' | 'postalCode'> & Partial<ShippingAddress>;
};

export type ShippingQuote = {
  currency: 'EUR';
  shippingPrice: number;
  isFree: boolean;
  method: 'standard';
};

const FIXED_SHIPPING_EUR = 5.9;

export function calculateShippingQuote({}: ShippingQuoteInput): ShippingQuote {
  return {
    currency: 'EUR',
    shippingPrice: FIXED_SHIPPING_EUR,
    isFree: false,
    method: 'standard',
  };
}
