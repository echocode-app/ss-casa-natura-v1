/* ================= Products ================= */

export interface Product {
  id: string;
  slug: string;

  /** Auto-generated SKU in format: 0001, 0002, ..., 0100, 0101, etc. */
  sku: string;

  title: string;
  description?: string;

  categoryIds: ProductCategory['id'][];
  lineId?: ProductLine['id'];

  /** Images from Cloudinary (products folder). Alt text is required. */
  images: ProductImage[];

  /** Optional variants, max 5. Each variant needs weightGrams. */
  variants?: ProductVariant[];

  /** Weight in grams (required for shipping calculation) */
  weightGrams: number;

  price: number;
  currency: 'EUR';

  stock?: number;
  isAvailable?: boolean;

  discount?: ProductDiscount;
  promoEligible?: boolean;

  isBestSeller?: boolean;

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
  /** Weight in grams for this variant (required for shipping) */
  weightGrams: number;
  priceModifier?: number; // + / -
  stock?: number;
  isAvailable?: boolean;
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
  /** Required alt text for accessibility and SEO */
  alt: string;
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
