'use client';

import { WaveBackground } from '@/components/ui/Parts';
import ProductCard from '@/components/ui/Products/ProductCard';
import Spinner from '@/components/ui/Spinner/Spinner';
import { useState, useEffect } from 'react';

const products = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  title: `Prodotto ${i + 1}`,
  volume: 'ml 750',
  price: '€ 10.00',
  imageSrc: '/images/home/product.png',
}));

export default function TopProductsSection() {
  const [loading, setLoading] = useState(true);

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

  if (!products || products.length === 0) return null;

  return (
    <section className="py-16 xl:py-20 relative overflow-x-hidden">
      <WaveBackground color="#F9F8D6" />
      <div className="relative z-10 mx-auto max-w-[1570px] px-2 md:px-8 lg:px-10 xl:px-12">
        <h2 className="heading-default heading-sm lg:heading-lg xl:heading-xl mb-12 md:mb-16 xl:mb-20">
          I nostri prodotti più <span className="heading-accent">amati</span>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-x-[clamp(10px,2vw,30px)] gap-y-[clamp(10px,2vw,30px)]">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </section>
  );
}
