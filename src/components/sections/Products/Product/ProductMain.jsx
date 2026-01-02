'use client';

import Image from 'next/image';
import { PrimaryButton } from '@/components/ui/Buttons';
import ProductVolumeSelector from './ProductVolumeSelector';
import { useState } from 'react';

export default function ProductMain({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] ?? null);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    ('Add to cart:', product.id, selectedVariant.id);
  };

  const finalPrice = selectedVariant
    ? product.price + (selectedVariant.priceModifier ?? 0)
    : product.price;

  return (
    <div className="max-w-[1570px] mx-auto px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col lg:flex-row gap-10 lg:gap-16 mt-8">
      {/* Image */}
      <div className="flex-1 flex justify-center lg:justify-start">
        <Image
          src={product.images?.[0]?.src || '/images/home/product.png'}
          alt={product.title}
          width={400}
          height={400}
          className="object-contain rounded-lg"
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col gap-4 lg:gap-6">
        <h1 className="text-h-lg lg:text-h-xl font-semibold">{product.title}</h1>
        <p className="text-sm text-gray-600">art.{product.sku}</p>

        {/* Volume selector */}
        {product.variants?.length > 0 && (
          <ProductVolumeSelector variants={product.variants} onChange={setSelectedVariant} />
        )}

        {/* Price */}
        <div className="mt-2 text-[clamp(20px,4vw,28px)] font-bold">€ {finalPrice.toFixed(2)}</div>

        {/* Buy button */}
        <PrimaryButton
          onClick={handleAddToCart}
          disabled={!selectedVariant}
          className="mt-4 w-full lg:w-[200px]"
        >
          Aggiungi
        </PrimaryButton>

        {/* Description */}
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">Dettagli prodotto</h2>
          <p className="text-text-primary leading-relaxed">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
