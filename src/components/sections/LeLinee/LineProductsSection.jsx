'use client';

import ProductCard from '@/components/ui/Products/ProductCard';
import WaveBackground from '@/components/ui/Parts/WaveBackground';
import { PRODUCTS_MOCK } from '@/config/products/products.mock';

export default function LineProductsSection({ lineSlug, bgColor }) {
  const products = PRODUCTS_MOCK.filter((product) => product.lineId === lineSlug);

  if (!products.length) return null;

  return (
    <section className="relative py-6 xl:py-10 overflow-x-hidden">
      <WaveBackground color={bgColor} />

      <div className="mx-auto max-w-[1570px] px-2 md:px-8 relative z-10">
        <h2 className="heading-sm lg:heading-lg xl:heading-xl mb-8 text-center">
          Tutti prodotti della linea
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              title={p.title}
              volume={p.volume}
              price={p.price}
              imageSrc={p.images[0]?.src || '/images/home/product.png'}
              slug={p.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
