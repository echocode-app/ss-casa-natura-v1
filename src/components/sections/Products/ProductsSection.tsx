'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ProductsFiltersSection from './ProductsFiltersSection';
import ProductsGridSection from './ProductsGridSection';
import { fetchProducts } from '@/lib/utils/fetchProducts';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { Product } from '@/config/products/product.types';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useTranslations } from 'next-intl';
import ProductsWaveBackground from '@/components/ui/Parts/ProductsWaveBackground';
import { useSmoothLoading } from '@/hooks/useSmoothLoading';
import { usePaginatedProducts } from '@/hooks/usePaginatedProducts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { useDebounce } from '@/hooks/useDebounce';

interface ProductsSectionProps {
  initialFilterId?: string;
  initialCategoryIds?: string[];
}

const PRODUCTS_PER_PAGE = 6;
const FILTER_DEBOUNCE_MS = 300;

export default function ProductsSection({
  initialFilterId,
  initialCategoryIds = [],
}: ProductsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const showInitialSpinner = useSmoothLoading(loading, 150, 300);

  const t = useTranslations('prodotti.list');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const data = await fetchProducts(true);
        setProducts(data);
      } catch {
        setError('fetchError');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (initialCategoryIds.length) {
      setSelectedCategories(initialCategoryIds);
      setAppliedCategories(initialCategoryIds);
      return;
    }

    if (initialFilterId) {
      const segment = PRODUCT_FILTERS.find((f) => f.id === initialFilterId);
      const ids = segment?.categoryIds ?? [];
      setSelectedCategories(ids);
      setAppliedCategories(ids);
      return;
    }

    setSelectedCategories([]);
    setAppliedCategories([]);
  }, [initialFilterId, initialCategoryIds]);

  const filteredProducts = useMemo(() => {
    if (!appliedCategories.length) return products;

    return products.filter((product) =>
      product.categoryIds?.some((catId: string) => appliedCategories.includes(catId)),
    );
  }, [appliedCategories, products]);

  const { displayedProducts, hasMore, loadMore, reset } = usePaginatedProducts({
      products: filteredProducts,
      pageSize: PRODUCTS_PER_PAGE,
    });

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: isFiltering,
    threshold: 0.5,
    rootMargin: '200px',
  });

  const debouncedApplyFilters = useDebounce(() => {
    setAppliedCategories([...selectedCategories]);
    setIsFiltering(false);
  }, FILTER_DEBOUNCE_MS);

  const applyFilters = useCallback(() => {
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    setIsFiltering(true);
    reset();
    debouncedApplyFilters();
  }, [selectedCategories, reset, debouncedApplyFilters]);

  return (
    <section ref={sectionRef} className="relative py-16 xl:py-20">
      <div className="absolute inset-x-0 bottom-0 top-[600px] xl:top-[760px] bg-[#F9F8D6] z-0" />

      <ProductsWaveBackground color="#F9F8D6" />

      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-10 lg:mb-16">
          {t('title')}
        </h2>

        {showInitialSpinner ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-red-600 mb-4">{t(error)}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <ProductsFiltersSection
              activeFilter={selectedCategories}
              setActiveFilter={setSelectedCategories}
              _isOpen={isFilterOpen}
              onToggle={setIsFilterOpen}
              onApply={applyFilters}
            />

            <div ref={gridRef} className="relative flex-1 transition-opacity duration-300">
              <ProductsGridSection
                products={displayedProducts}
                isLoading={isFiltering}
                showSkeleton={isFiltering && displayedProducts.length === 0}
              />

              {hasMore && displayedProducts.length > 0 && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
