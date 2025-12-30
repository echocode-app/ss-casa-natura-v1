'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProductsCategoriesSection, ProductsSection } from '@/components/sections/Products';
import { PRODUCT_FILTERS } from '@/config/products/product.filters';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { Product } from '@/config/products/product.types';

export default function ProdottiPage() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(PRODUCTS_MOCK);

  // Set selected categories based on URL param
  useEffect(() => {
    if (categoryParam) {
      const segment = PRODUCT_FILTERS.find((seg) => seg.id === categoryParam);
      setSelectedCategories(segment?.categoryIds || []);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  // Filter products whenever selectedCategories changes
  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredProducts(PRODUCTS_MOCK);
    } else {
      setFilteredProducts(
        PRODUCTS_MOCK.filter((product) =>
          product.categoryIds.some((id) => selectedCategories.includes(id)),
        ),
      );
    }
  }, [selectedCategories]);

  return (
    <main>
      <ProductsCategoriesSection />
      <ProductsSection initialFilterId={categoryParam} />
    </main>
  );
}
