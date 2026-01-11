'use client';

import { useState, useEffect } from 'react';
import { ProductBreadcrumbs, RelatedProductsSection } from '@/components/sections/Products/Product';
import ProductMain from '@/components/sections/Products/Product/ProductMain';
import { fetchProduct, fetchProducts } from '@/lib/utils/fetchProducts';
import { Product } from '@/config/products/product.types';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

export default function ProductPageClient() {
  const params = useParams();
  const slug = params.slug as string;
  const t = useTranslations('prodotti');

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const showSpinner = useSmoothLoading(loading, 150, 280);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) return;

      try {
        const prod = await fetchProduct(slug, true);
        if (!prod) return;

        setProduct(prod);

        const allProducts = await fetchProducts(true);
        const categoryId = prod.categoryIds[0];
        const related = allProducts.filter(
          (p) => p.categoryIds.includes(categoryId) && p.id !== prod.id,
        );
        setRelatedProducts(related);
      } catch {
        // Handle error silently or show user message
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (showSpinner) return <FullscreenSpinner />;
  if (!slug || !product) return <div>{t('notFound')}</div>;

  return (
    <>
      <ProductBreadcrumbs product={product} />
      <ProductMain product={product} />
      <RelatedProductsSection products={relatedProducts} />
    </>
  );
}
