'use client';

import { useState, useEffect, useMemo } from 'react';
import ProductsFiltersSection from './ProductsFiltersSection';
import ProductsGridSection from './ProductsGridSection';
import { fetchProducts } from '@/lib/utils/fetchProducts';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { Product } from '@/config/products/product.types';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useTranslations } from 'next-intl';
import ProductsWaveBackground from '@/components/ui/Parts/ProductsWaveBackground';

interface ProductsSectionProps {
  initialFilterId?: string;
  initialCategoryIds?: string[];
}

export default function ProductsSection({
  initialFilterId,
  initialCategoryIds = [],
}: ProductsSectionProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const t = useTranslations('prodotti.list');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(true); // Start with mock
        setProducts(data);
      } catch (error) {
        // Handle error silently
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

  const applyFilters = () => {
    setIsFiltering(true);

    setTimeout(() => {
      setAppliedCategories([...selectedCategories]);
      setIsFiltering(false);
    }, 200);
  };

  return (
    <section className="relative py-16 xl:py-20">
      <div className="absolute inset-x-0 bottom-0 top-[600px] xl:top-[760px] bg-[#F9F8D6] z-0" />

      <ProductsWaveBackground color="#F9F8D6" />

      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-10 lg:mb-16">
          {t('title')}
        </h2>

        {loading ? (
          <div className="flex justify-center">
            <Spinner size="lg" />
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

            <div className="relative flex-1">
              {isFiltering && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-sm">
                  <Spinner size="lg" />
                </div>
              )}

              <ProductsGridSection products={filteredProducts} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
