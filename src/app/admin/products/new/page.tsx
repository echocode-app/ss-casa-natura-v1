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
  currency: 'EUR',
};

export default function AdminNewProductPage() {
  return <CatalogProductForm mode="new" initial={initial} />;
}
