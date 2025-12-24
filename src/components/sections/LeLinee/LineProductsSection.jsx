'use client';

import React from 'react';
import ProductCard from '@/components/ui/Products/ProductCard';
import WaveBackground from '@/components/ui/Parts/WaveBackground';

export default function LineProductsSection({ categoryId, bgColor }) {
  const products = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    title: `Prodotto ${i + 1}`,
    volume: 'ml 750',
    price: '€ 10.00',
    imageSrc: '/images/home/product.png',
    href: `/product/${i}`,
  }));

  if (!products.length) return null;

  return (
    <section className="relative py-16 overflow-x-hidden">
      {/* Wave background */}
      <WaveBackground color={bgColor} />

      <div className="mx-auto max-w-[1570px] px-2 md:px-8 relative z-10">
        <h2 className="heading-default mb-12 text-center">Tutti prodotti della linea</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
