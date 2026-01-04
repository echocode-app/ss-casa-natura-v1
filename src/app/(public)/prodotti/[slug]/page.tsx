'use client';

import { ProductBreadcrumbs, RelatedProductsSection } from '@/components/sections/Products/Product';
import ProductMain from '@/components/sections/Products/Product/ProductMain';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function ProductPageClient() {
  const params = useParams();
  const slug = params.slug;
  const t = useTranslations('prodotti');

  if (!slug) return <div>{t('notFound')}</div>;

  const product = PRODUCTS_MOCK.find((p) => p.slug === slug);

  if (!product) return <div>{t('notFound')}</div>;

  const categoryId = product.categoryIds[0];
  const relatedProducts = PRODUCTS_MOCK.filter(
    (p) => p.categoryIds.includes(categoryId) && p.id !== product.id,
  );

  return (
    <>
      <ProductBreadcrumbs product={product} />
      <ProductMain product={product} />
      <RelatedProductsSection products={relatedProducts} />
    </>
  );
}
