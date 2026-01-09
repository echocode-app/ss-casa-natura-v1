'use client';

import Image from 'next/image';
import { PrimaryButton } from '@/components/ui/Buttons';
import ProductVolumeSelector from './ProductVolumeSelector';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import Spinner from '@/components/ui/Spinner/Spinner';

export default function ProductMain({ product }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] ?? null);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const t = useTranslations('prodotti.related');

  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    setIsAdding(true);
    try {
      await addItem(product.id, selectedVariant.id);
      // Could add toast notification here
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const finalPrice = selectedVariant
    ? product.price + (selectedVariant.priceModifier ?? 0)
    : product.price;

  return (
    <div className="max-w-[1570px] mx-auto px-6 md:px-8 lg:px-10 xl:px-12 flex flex-col lg:flex-row gap-6 lg:gap-10 mt-4">
      {/* Image */}
      <div className="flex-1 flex items-center justify-start mb-auto">
        <Image
          src={product.images?.[0]?.src || '/images/home/product.png'}
          alt={product.title}
          className="object-contain lg:w-full lg:h-full max-h-[80%] mx-auto"
          width={587}
          height={550}
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between lg:justify-normal gap-3">
        <div>
          <h1 className="text-[clamp(22px,4vw,30px)] font-semibold">{product.title}</h1>
          <p className="text-[clamp(14px,4vw,20px)] mt-3">{product.sku}</p>

          {/* Volume selector */}
          {product.variants?.length > 0 && (
            <ProductVolumeSelector variants={product.variants} onChange={setSelectedVariant} />
          )}

          {/* Price */}
          <div className="mt-7 text-[clamp(18px,4vw,25px)] font-bold">
            € {finalPrice.toFixed(2)}
          </div>

          {/* Buy button */}
          <PrimaryButton
            onClick={handleAddToCart}
            disabled={!selectedVariant || isAdding}
            className="mt-6 p-6 mr-auto w-[200px] md:w-[300px]"
          >
            {isAdding ? <Spinner size="sm" colorScheme="muted" /> : t('addToCart')}
          </PrimaryButton>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-5 lg:mt-8 lg:ml-0">
            <h2 className="font-semibold text-[clamp(16px,4vw,22px)] mb-4">{t('details')}</h2>
            <p className="text-[clamp(12px,4vw,17px)] text-[#373434] whitespace-pre-line leading-[20px]">
              {product.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
