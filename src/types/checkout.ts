export type CheckoutCustomer = {
  email: string;
  name: string;
  surname?: string;
  phone?: string;
};

export type ShippingAddress = {
  country: string;
  city: string;
  postalCode: string;
  addressLine1: string;
  company?: string;
  addressLine2?: string;
  province?: string;
};

export type CheckoutItemInput = {
  productId: string;
  variantId: string;
  quantity: number;
};

export type ShippingQuoteRequest = {
  address: Pick<ShippingAddress, 'country' | 'postalCode'> & Partial<ShippingAddress>;
  items?: CheckoutItemInput[];
};

export type ShippingQuoteResponse = {
  success: boolean;
  quote?: {
    currency: 'EUR';
    shippingPrice: number;
    recurringPrice?: number;
    subtotal: number;
    promoDiscount: number;
    total: number;
    totalWeightKg: number;
  };
  error?: string;
};

export type CheckoutCreateRequest = {
  customer: CheckoutCustomer;
  address: ShippingAddress;
  marketingOptIn?: boolean;
  shippingMethod?: 'one_time' | 'recurring_4w';
  items?: CheckoutItemInput[];
};

export type CheckoutCreateResponse = {
  success: boolean;
  clientSecret?: string;
  orderId?: string;
  amount?: number;
  currency?: 'EUR';
  error?: string;
};
