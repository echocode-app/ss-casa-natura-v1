'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/Products/ProductCard';
import ProductCardSkeleton from '@/components/ui/Products/ProductCardSkeleton';
import WaveBackground from '@/components/ui/Parts/WaveBackground';
import Spinner from '@/components/ui/Spinner/Spinner';
import { fetchProducts } from '@/lib/utils/fetchProducts';
import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import { usePaginatedProducts } from '@/hooks/usePaginatedProducts';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';

const PRODUCTS_PER_PAGE = 4;

export default function LineProductsSection({ lineSlug, bgColor }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const t = useTranslations('linee');
  const { addItem } = useCart();

  const handleAddToCart = async (product) => {
    const variant = product.variants?.[0];
    if (!variant) return;
    await addItem(product.id, variant.id);
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const data = await fetchProducts(true);
        const filtered = data.filter((product) => product.lineId === lineSlug);
        setProducts(filtered);
      } catch {
        setError('fetchError');
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [lineSlug]);

  const { displayedProducts, hasMore, loadMore } = usePaginatedProducts({
    products,
    pageSize: PRODUCTS_PER_PAGE,
  });

  const loadMoreRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading: loading,
    threshold: 0.5,
    rootMargin: '200px',
  });

  if (loading) {
    return (
      <section className="relative py-6 xl:py-10 overflow-x-hidden">
        <WaveBackground color={bgColor} />
        <div className="mx-auto max-w-[1570px] px-2 md:px-8 relative z-10">
          <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-8 text-center">
            {t('lineProducts.title')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 auto-rows-fr">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ProductCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-6 xl:py-10 overflow-x-hidden">
        <WaveBackground color={bgColor} />
        <div className="mx-auto max-w-[1570px] px-2 md:px-8 relative z-10">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-lg text-red-600 mb-4">{t(error)}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-colors"
            >
              {t('retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!products.length) return null;

  return (
    <section className="relative py-6 xl:py-10 overflow-x-hidden">
      <WaveBackground color={bgColor} />

      <div className="mx-auto max-w-[1570px] px-2 md:px-8 relative z-10">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-8 text-center">
          {t('lineProducts.title')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 auto-rows-fr">
          {displayedProducts.map((product) => (
            <ProductCard
              className="w-full"
              key={product.id}
              title={product.title}
              volume={product.variants?.[0]?.volume}
              price={product.variants?.[0]?.price ?? 0}
              discountPrice={product.discountPrice}
              imageSrc={product.images?.[0]?.src || product.imageSrc || '/images/home/product.png'}
              slug={product.slug}
              isAvailable={product.isAvailable}
              stock={product.stock}
              onAddClick={() => handleAddToCart(product)}
              isBestSeller={product.isBestSeller}
              isEco={product.isEco}
              isNew={product.isNew}
            />
          ))}
        </div>

        {hasMore && displayedProducts.length > 0 && (
          <div ref={loadMoreRef} className="flex justify-center py-8">
            <Spinner size="md" />
          </div>
        )}
      </div>
    </section>
  );
}
