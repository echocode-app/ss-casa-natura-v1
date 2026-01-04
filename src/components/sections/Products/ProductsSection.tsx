'use client';

import { useState, useEffect, useMemo } from 'react';
import ProductsFiltersSection from './ProductsFiltersSection';
import ProductsGridSection from './ProductsGridSection';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { WaveBackground } from '@/components/ui/Parts';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useTranslations } from 'next-intl';

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

  const t = useTranslations('prodotti.list');

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
    if (!appliedCategories.length) return PRODUCTS_MOCK;

    return PRODUCTS_MOCK.filter((product) =>
      product.categoryIds?.some((catId) => appliedCategories.includes(catId)),
    );
  }, [appliedCategories]);

  const applyFilters = () => {
    setIsFiltering(true);

    setTimeout(() => {
      setAppliedCategories([...selectedCategories]);
      setIsFiltering(false);
    }, 200);
  };

  return (
    <section className="py-16 xl:py-20 relative overflow-x-hidden">
      <WaveBackground color="#F9F8D6" />

      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-10 lg:mb-16">
          {t('title')}
        </h2>

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
      </div>
    </section>
  );
}
