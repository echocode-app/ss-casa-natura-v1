'use client';

import { useState, useEffect, useMemo } from 'react';
import ProductsFiltersSection from './ProductsFiltersSection';
import ProductsGridSection from './ProductsGridSection';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { WaveBackground } from '@/components/ui/Parts';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';

export default function ProductsSection({ initialFilterId }) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [appliedCategories, setAppliedCategories] = useState([]);

  // 🟢 Встановлюємо початковий фільтр при рендері
  useEffect(() => {
    if (initialFilterId) {
      const segment = PRODUCT_FILTERS.find((f) => f.id === initialFilterId);
      const ids = segment?.categoryIds || [];
      setSelectedCategories([...ids]);
      setAppliedCategories([...ids]); // автоматично застосовуємо
    } else {
      setSelectedCategories([]);
      setAppliedCategories([]);
    }
  }, [initialFilterId]);

  const filteredProducts = useMemo(() => {
    if (!appliedCategories.length) return PRODUCTS_MOCK;
    return PRODUCTS_MOCK.filter((product) =>
      product.categoryIds?.some((catId) => catId && appliedCategories.includes(catId)),
    );
  }, [appliedCategories]);

  const applyFilters = () => setAppliedCategories([...selectedCategories]);

  return (
    <section className="py-16 xl:py-20 relative overflow-x-hidden">
      <WaveBackground color="#F9F8D6" />
      <div className="relative flex-shrink-0 z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-10 lg:mb-16">
          I nostri prodotti
        </h2>

        <div className="flex flex-col lg:flex-row gap-8">
          <ProductsFiltersSection
            activeFilter={selectedCategories}
            setActiveFilter={setSelectedCategories}
            _isOpen={isFilterOpen}
            onToggle={setIsFilterOpen}
            onApply={applyFilters}
          />

          <ProductsGridSection products={filteredProducts} />
        </div>
      </div>
    </section>
  );
}
