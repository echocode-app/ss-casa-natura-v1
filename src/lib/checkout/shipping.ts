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

const FREE_SHIPPING_THRESHOLD_EUR = 49;
const BASE_SHIPPING_EUR = 5.99;
const PER_KG_EUR = 1.2;

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateShippingQuote({
  subtotal,
  totalWeightKg,
}: ShippingQuoteInput): ShippingQuote {
  const isFree = subtotal >= FREE_SHIPPING_THRESHOLD_EUR;
  const shippingPrice = isFree
    ? 0
    : roundMoney(BASE_SHIPPING_EUR + PER_KG_EUR * Math.max(0, totalWeightKg));

  return {
    currency: 'EUR',
    shippingPrice,
    isFree,
    method: 'standard',
  };
}
