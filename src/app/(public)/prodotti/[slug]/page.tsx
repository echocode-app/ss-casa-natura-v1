'use client';

import { useState, useEffect } from 'react';
import { ProductBreadcrumbs, RelatedProductsSection } from '@/components/sections/Products/Product';
import ProductMain from '@/components/sections/Products/Product/ProductMain';
import ProductNotFound from '@/components/sections/Products/ProductNotFound';
import { fetchProduct, fetchProducts } from '@/lib/utils/fetchProducts';
import { Product } from '@/config/products/product.types';
import { useParams } from 'next/navigation';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';

export default function ProductPageClient() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const showSpinner = useSmoothLoading(loading, 150, 280);

  useEffect(() => {
    const loadProduct = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const prod = await fetchProduct(slug, true);
        if (!prod) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProduct(prod);

        const allProducts = await fetchProducts(true);
        const categoryId = prod.categoryIds[0];
        const related = allProducts.filter(
          (p) => p.categoryIds.includes(categoryId) && p.id !== prod.id,
        );
        setRelatedProducts(related);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [slug]);

  if (showSpinner) return <FullscreenSpinner />;
  if (notFound || !product) return <ProductNotFound />;

  return (
    <>
      <ProductBreadcrumbs product={product} />
      <ProductMain product={product} />
      <RelatedProductsSection products={relatedProducts} />
    </>
  );
}
