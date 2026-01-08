'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ui/Products/ProductCard';
import WaveBackground from '@/components/ui/Parts/WaveBackground';
import { fetchProducts } from '@/lib/utils/fetchProducts';
// import { Product } from '@/config/products/product.types';
import { useTranslations } from 'next-intl';

export default function LineProductsSection({ lineSlug, bgColor }) {
  const [products, setProducts] = useState([]);
  const t = useTranslations('linee');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts(true);
        setProducts(data.filter((product) => product.lineId === lineSlug));
      } catch (error) {
        ('Failed to load products:', error);
      }
    };
    loadProducts();
  }, [lineSlug]);

  if (!products.length) return null;

  return (
    <section className="relative py-6 xl:py-10 overflow-x-hidden">
      <WaveBackground color={bgColor} />

      <div className="mx-auto max-w-[1570px] px-2 md:px-8 relative z-10">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-8 text-center">
          {t('lineProducts.title')}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6 auto-rows-fr">
          {products.map((product) => (
            <ProductCard
              className="w-full"
              key={product.id}
              title={product.title}
              volume={product.variants?.[0]?.volume}
              price={product.variants?.[0]?.priceModifier || product.price}
              discountPrice={product.discountPrice}
              imageSrc={product.images?.[0]?.src || product.imageSrc || '/images/home/product.png'}
              slug={product.slug}
              onAddClick={() => ('Add to cart:', product.id)}
              isBestSeller={product.isBestSeller}
              isEco={product.isEco}
              isNew={product.isNew}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
