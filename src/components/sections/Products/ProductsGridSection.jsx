'use client';

import ProductCard from '@/components/ui/Products/ProductCard';
import ProductCardSkeleton from '@/components/ui/Products/ProductCardSkeleton';
import { useCart } from '@/contexts/CartContext';

export default function ProductsGridSection({ products, isLoading, showSkeleton }) {
  const { addItem } = useCart();

  const handleAddToCart = async (product) => {
    const variant = product.variants?.[0];
    if (!variant) return;
    await addItem(product.id, variant.id);
  };

  if (showSkeleton) {
    return (
      <div className="w-full min-w-0 grid grid-cols-2 xl:grid-cols-3 gap-x-[clamp(10px,2vw,25px)] gap-y-[clamp(16px,2vw,50px)]">
        {Array.from({ length: 12 }).map((_, idx) => (
          <ProductCardSkeleton key={`skeleton-${idx}`} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Nessun prodotto trovato</p>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-w-0 grid grid-cols-2 xl:grid-cols-3 gap-x-[clamp(10px,2vw,25px)] gap-y-[clamp(16px,2vw,50px)] transition-opacity duration-300 ${isLoading ? 'opacity-60' : 'opacity-100'}`}
    >
      {products.map((product) => (
        <ProductCard
          key={product.id}
          title={product.title}
          volume={product.variants?.[0]?.volume}
          price={product.variants?.[0]?.priceModifier || product.price}
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
  );
}
