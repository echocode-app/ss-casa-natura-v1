'use client';

import ProductCard from '@/components/ui/Products/ProductCard';

export default function ProductsGridSection({ products }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="w-full min-w-0 grid grid-cols-2 xl:grid-cols-3 gap-x-[clamp(10px,2vw,25px)] gap-y-[clamp(16px,2vw,50px)]">
      {products.map((product) => (
        <ProductCard
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
  );
}
