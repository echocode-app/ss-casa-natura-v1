'use client';

import { WaveBackground } from '@/components/ui/Parts';
import ProductCard from '@/components/ui/Products/ProductCard';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useState, useEffect } from 'react';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';
import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';

export default function TopProductsSection({ products }) {
  const [loading, setLoading] = useState(true);
  const t = useTranslations('topProductsSection');
  const { addItem } = useCart();

  const handleAddToCart = async (product) => {
    const variant = product.variants?.[0];
    if (!variant) return;
    await addItem(product.id, variant.id);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner size="lg" colorScheme="accent" />
      </div>
    );
  }

  const displayProducts = (
    Array.isArray(products) && products.length > 0 ? products : PRODUCTS_MOCK
  ).filter((p) => p.isBestSeller);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-16 xl:py-20 relative overflow-x-hidden">
      <WaveBackground color="#F9F8D6" />

      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-12 md:mb-16 xl:mb-20">
          {t('headerTitle')} <span className="heading-accent">{t('headerAccent')}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[clamp(10px,2vw,30px)]">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              title={product.title}
              volume={product.variants?.[0]?.volume}
              price={product.variants?.[0]?.priceModifier || product.price}
              discountPrice={product.discountPrice}
              imageSrc={product.images?.[0]?.src}
              slug={product.slug}
              isBestSeller={product.isBestSeller}
              onAddClick={() => handleAddToCart(product)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
