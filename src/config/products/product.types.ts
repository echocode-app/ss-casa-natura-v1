/* ================= Products ================= */

export interface Product {
  id: string;
  slug: string;

  sku: string;

  title: string;
  shortDescription?: string;
  description: string;

  categoryIds: ProductCategory['id'][];
  lineId?: ProductLine['id'];

  images: ProductImage[];

  variants: ProductVariant[];
  weightGrams: number;

  price: number;
  currency: 'EUR';

  discount?: ProductDiscount;
  promoEligible?: boolean;

  isEco?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  isSeasonal?: boolean;

  relatedProductIds?: Product['id'][];

  filters?: ProductFilterValue[];

  createdAt?: string;
  updatedAt?: string;
}

/* ================= Variants ================= */

export interface ProductVariant {
  id: string;
  label: string; // "500 ml", "1 L"
  volume: number;
  unit: 'ml' | 'l' | 'kg' | 'g';
  priceModifier?: number; // + / -
}

/* ================= Discounts ================= */

export interface ProductDiscount {
  type: 'percentage' | 'fixed';
  value: number;
  startAt?: string;
  endAt?: string;
}

/* ================= Categories ================= */

export interface ProductCategory {
  id: string;
  title: string;
  image?: string;
}

/* ================= Lines ================= */

export interface ProductLine {
  id: string;
  title: string;
  description?: string;
  image?: string;
}

/* ================= Images ================= */

export interface ProductImage {
  src: string;
  alt?: string;
}

/* ================= Filters ================= */

export type ProductFilterType = 'checkbox' | 'radio' | 'range';

export interface ProductFilter {
  id: string;
  title: string;
  type: ProductFilterType;
  items?: string[];
  categoryIds?: ProductCategory['id'][];
}

export interface ProductFilterValue {
  filterId: ProductFilter['id'];
  value: string | number | boolean;
}
