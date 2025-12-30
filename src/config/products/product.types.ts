export interface Product {
  id: string;
  slug: string;

  title: string;
  description?: string;

  categoryId: ProductCategory['id'];
  lineId?: ProductLine['id'];

  images: ProductImage[];

  volume?: string;
  price?: number;
  currency?: 'EUR';

  isEco?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;

  filters?: ProductFilterValue[];
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
}

export interface ProductFilterValue {
  filterId: ProductFilter['id'];
  value: string | number | boolean;
}
