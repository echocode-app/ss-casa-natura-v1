'use client';

import ProductCard from '@/components/ui/Products/ProductCard';
// import Wave from '@/components/ui/Parts/Wave';

export default function LineProductsSection({ categoryId, bgColor }) {
  // API
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
    <section className="relative py-16">
      {/* Wave background */}
      <div className="absolute inset-0 -z-10">
        {/* <Wave style={{ backgroundColor: bgColor }} /> */}
      </div>

      <div className="mx-auto max-w-[1570px] px-2 md:px-8">
        <h2 className="heading-default mb-12">Tutti prodotti della linea</h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}
