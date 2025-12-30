'use client';

import ProductCard from '@/components/ui/Products/ProductCard';

export default function ProductsGridSection({ products, isFilterOpen }) {
  return (
    <div className="w-full">
      <div
        className={`
          grid gap-6
          grid-cols-1 sm:grid-cols-2 md:grid-cols-2
          lg:grid-cols-3 xl:${isFilterOpen ? 'grid-cols-3' : 'grid-cols-4'}
        `}
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            title={product.title}
            volume={product.volume}
            price={product.price ? `€ ${product.price.toFixed(2)}` : ''}
            imageSrc={product.images[0]?.src || '/images/home/product.png'}
            href={`/prodotti/${product.slug}`}
            onAddClick={() => console.log('Add to cart:', product.id)}
          />
        ))}
      </div>
    </div>
  );
}
