'use client';

import CatalogProductForm, {
  type CatalogProductDraft,
} from '@/components/admin/products/CatalogProductForm';

const initial: CatalogProductDraft = {
  id: '',
  slug: '',
  sku: '',
  title: '',
  shortDescription: '',
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
  promoEligible: true,
  isEco: false,
  isNew: false,
  isBestSeller: false,
  isSeasonal: false,
  relatedProductIds: [],
};

export default function AdminNewProductPage() {
  return <CatalogProductForm mode="new" initial={initial} />;
}
