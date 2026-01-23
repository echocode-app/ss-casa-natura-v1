'use client';

import CatalogProductForm, {
  type CatalogProductDraft,
} from '@/components/admin/products/CatalogProductForm';

const initial: CatalogProductDraft = {
  slug: '',
  sku: '',
  title: '',
  description: '',
  categoryIds: [],
  lineId: '',
  images: [],
  variants: [],
  weightGrams: 0,
  price: 0,
  currency: 'EUR',
  stock: 0,
  isAvailable: true,
  promoEligible: false,
  isBestSeller: false,
};

export default function AdminNewProductPage() {
  return <CatalogProductForm mode="new" initial={initial} />;
}
