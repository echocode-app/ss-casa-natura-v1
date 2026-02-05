'use client';

import { WaveBackground } from '@/components/ui/Parts';
import ProductCard from '@/components/ui/Products/ProductCard';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import { getFirstPurchasableVariant, sortProducts } from '@/lib/utils/sortProducts';

export default function TopProductsSection({ products }) {
  const [loading, setLoading] = useState(true);
  const [localProducts, setLocalProducts] = useState(Array.isArray(products) ? products : []);
  const t = useTranslations('topProductsSection');
  const { addItem } = useCart();

  const handleAddToCart = async (product) => {
    const variant = getFirstPurchasableVariant(product) ?? product.variants?.[0];
    if (!variant) return;
    await addItem(product.id, variant.id);
  };

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (Array.isArray(products) && products.length > 0) {
      setLocalProducts(products);
      return;
    }

    let mounted = true;
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setLocalProducts(data);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [products]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Spinner size="lg" colorScheme="accent" />
      </div>
    );
  }

  const sortedProducts = sortProducts(Array.isArray(localProducts) ? localProducts : []);
  const bestSellerProducts = sortedProducts.filter((product) =>
    product.variants?.some((variant) => variant.isBestSeller),
  );
  const bestSellerIds = new Set(bestSellerProducts.map((product) => product.id));
  const nonBestSellerProducts = sortedProducts.filter((product) => !bestSellerIds.has(product.id));
  const displayProducts = [...bestSellerProducts, ...nonBestSellerProducts].slice(0, 8);

  if (displayProducts.length === 0) return null;

  return (
    <section className="py-16 xl:py-20 relative overflow-x-hidden">
      <WaveBackground color="#F9F8D6" />

      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-12 md:mb-16 xl:mb-20">
          {t('headerTitle')} <span className="heading-accent">{t('headerAccent')}</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[clamp(10px,2vw,30px)]">
          {displayProducts.map((product) => {
            const variant = getFirstPurchasableVariant(product) ?? product.variants?.[0] ?? null;

            return (
              <ProductCard
                key={product.id}
                title={product.title}
                volume={variant?.volume}
                unit={variant?.unit}
                price={variant?.price ?? 0}
                discountPrice={product.discountPrice}
                imageSrc={product.images?.[0]?.src}
                slug={product.slug}
                isBestSeller={variant?.isBestSeller ?? false}
                isAvailable={variant?.isAvailable ?? product.isAvailable}
                stock={variant?.stock ?? product.stock}
                onAddClick={() => handleAddToCart(product)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
