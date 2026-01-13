'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';

import { ProductsCategoriesSection, ProductsSection } from '@/components/sections/Products';
import FullscreenSpinner from '@/components/ui/Spinner/FullscreenSpinner';

import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';
import { getSeoMeta, buildBreadcrumbs, JsonLd, ClientSeoHead } from '@/lib/seo';

export default function ProdottiPage() {
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const categoryParam = searchParams.get('category');
  const subcategoryParam = searchParams.get('subcategory');

  const [initialFilterId, setInitialFilterId] = useState<string | undefined>(undefined);
  const [initialCategoryIds, setInitialCategoryIds] = useState<string[]>([]);

  useEffect(() => {
    startTransition(() => {
      if (subcategoryParam) {
        setInitialFilterId(undefined);
        setInitialCategoryIds([subcategoryParam]);
        return;
      }

      if (categoryParam) {
        const segment = PRODUCT_FILTERS.find((seg) => seg.id === categoryParam);

        setInitialFilterId(segment?.id);
        setInitialCategoryIds(segment?.categoryIds ?? []);
        return;
      }

      setInitialFilterId(undefined);
      setInitialCategoryIds([]);
    });
  }, [categoryParam, subcategoryParam]);

  const showSpinner = useSmoothLoading(isPending, 150, 280);

  // Determine SEO based on filters
  const seoType = subcategoryParam ? 'subcategory' : categoryParam ? 'category' : 'homepage';
  const seoSlug = subcategoryParam || categoryParam || undefined;

  const breadcrumbs = buildBreadcrumbs([{ label: 'Prodotti', href: '/prodotti' }]);

  const seo = getSeoMeta({
    type: seoType,
    slug: seoSlug,
    breadcrumbs,
    path: `/prodotti${categoryParam ? `?category=${categoryParam}` : ''}${subcategoryParam ? `?subcategory=${subcategoryParam}` : ''}`,
  });

  return (
    <>
      <ClientSeoHead seo={seo} />
      <JsonLd data={seo.structuredData} />
      <main className="relative">
        {showSpinner && <FullscreenSpinner />}

        <ProductsCategoriesSection />

        <ProductsSection
          initialFilterId={initialFilterId}
          initialCategoryIds={initialCategoryIds}
        />
      </main>
    </>
  );
}
