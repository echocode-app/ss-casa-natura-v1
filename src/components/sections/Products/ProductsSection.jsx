'use client';

import { useState } from 'react';
import ProductsFiltersSection from './ProductsFiltersSection';
import ProductsGridSection from './ProductsGridSection';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';

export default function ProductsSection() {
  const [isFilterOpen, setIsFilterOpen] = useState(true);

  return (
    <section className="w-full flex flex-col lg:flex-row gap-6">
      <div className={`w-full lg:w-[412px] flex-shrink-0`}>
        <ProductsFiltersSection isOpen={isFilterOpen} onToggle={(open) => setIsFilterOpen(open)} />
      </div>

      <div className="flex-1">
        <ProductsGridSection products={PRODUCTS_MOCK} isFilterOpen={isFilterOpen} />
      </div>
    </section>
  );
}
