import { useState, useCallback, useMemo } from 'react';
import { Product } from '@/config/products/product.types';
import { sortProducts } from '@/lib/utils/sortProducts';

interface UsePaginatedProductsOptions {
  products: Product[];
  pageSize?: number;
}

export function usePaginatedProducts({ products, pageSize = 12 }: UsePaginatedProductsOptions) {
  const [currentPage, setCurrentPage] = useState(1);

  const sortedProducts = useMemo(() => sortProducts(products), [products]);

  const totalPages = Math.ceil(sortedProducts.length / pageSize);
  const hasMore = currentPage < totalPages;

  const displayedProducts = useMemo(() => {
    return sortedProducts.slice(0, currentPage * pageSize);
  }, [sortedProducts, currentPage, pageSize]);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasMore]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    displayedProducts,
    hasMore,
    loadMore,
    reset,
    totalProducts: sortedProducts.length,
    displayedCount: displayedProducts.length,
    currentPage,
  };
}
