import { ShippingAddress } from '@/types/checkout';

export type ShippingQuoteInput = {
  subtotal: number;
  totalWeightKg: number;
  address: Pick<ShippingAddress, 'country' | 'postalCode'> & Partial<ShippingAddress>;
};

export type ShippingSettings = {
  pricePerGram: number;
  pricePerKg?: number;
  fixedFee: number;
  recurringFee?: number;
};

export type ShippingQuote = {
  currency: 'EUR';
  shippingPrice: number;
  recurringPrice: number;
  isFree: boolean;
  method: 'standard';
};

const DEFAULT_SETTINGS: ShippingSettings = {
  pricePerGram: 0,
  fixedFee: 0,
};

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function normalizeShippingSettings(
  settings?: Partial<ShippingSettings> | null,
): ShippingSettings {
  const rawPricePerGram =
    settings?.pricePerGram ??
    (settings?.pricePerKg !== undefined ? Number(settings.pricePerKg) / 1000 : undefined);
  const pricePerGram = Math.max(0, Number(rawPricePerGram ?? DEFAULT_SETTINGS.pricePerGram) || 0);
  const fixedFee = Math.max(0, Number(settings?.fixedFee ?? DEFAULT_SETTINGS.fixedFee) || 0);
  const recurringFeeValue = settings?.recurringFee;
  const recurringFee =
    recurringFeeValue === undefined || recurringFeeValue === null
      ? undefined
      : Math.max(0, Number(recurringFeeValue) || 0);
  return { pricePerGram, fixedFee, recurringFee };
}

export function calculateShippingQuote(
  { totalWeightKg }: ShippingQuoteInput,
  settings?: Partial<ShippingSettings> | null,
): ShippingQuote {
  // Convert total weight to grams and apply per-gram pricing plus fixed fee.
  const normalized = normalizeShippingSettings(settings);
  const totalWeightGrams = Math.max(0, Number(totalWeightKg || 0)) * 1000;
  const shippingPrice = roundMoney(
    totalWeightGrams * normalized.pricePerGram + normalized.fixedFee,
  );
  const recurringPrice = roundMoney(
    normalized.recurringFee !== undefined ? normalized.recurringFee : shippingPrice,
  );
  return {
    currency: 'EUR',
    shippingPrice,
    recurringPrice,
    isFree: shippingPrice <= 0,
    method: 'standard',
  };
}
